# Invokes Anthropic generate text API using requests module
# see https://console.anthropic.com/docs/api/reference for more details

import os
import json
import re
import boto3

# grab environment variables
BEDROCK_MODEL_ID = os.environ["BEDROCK_MODEL_ID"]
FETCH_TRANSCRIPT_LAMBDA_ARN = os.environ['FETCH_TRANSCRIPT_LAMBDA_ARN']
PROCESS_TRANSCRIPT = (os.getenv('PROCESS_TRANSCRIPT', 'False') == 'True')
TOKEN_COUNT = int(os.getenv('TOKEN_COUNT', '0')) # default 0 - do not truncate.
S3_BUCKET_NAME = os.environ['S3_BUCKET_NAME']
S3_PREFIX = os.environ['S3_PREFIX']

# Table name and keys used for default and custom prompt templates items in DDB
LLM_PROMPT_TEMPLATE_TABLE_NAME = os.environ["LLM_PROMPT_TEMPLATE_TABLE_NAME"]
DEFAULT_PROMPT_TEMPLATES_PK = "DefaultSummaryPromptTemplates"
CUSTOM_PROMPT_TEMPLATES_PK = "CustomSummaryPromptTemplates"

# Optional environment variables allow region / endpoint override for bedrock Boto3
BEDROCK_REGION = os.environ["BEDROCK_REGION_OVERRIDE"] if "BEDROCK_REGION_OVERRIDE" in os.environ else os.environ["AWS_REGION"]
BEDROCK_ENDPOINT_URL = os.environ.get("BEDROCK_ENDPOINT_URL", f'https://bedrock-runtime.{BEDROCK_REGION}.amazonaws.com')



lambda_client = boto3.client('lambda')
dynamodb_client = boto3.client('dynamodb')
bedrock = boto3.client(service_name='bedrock-runtime', region_name=BEDROCK_REGION, endpoint_url=BEDROCK_ENDPOINT_URL) 

def get_templates_from_dynamodb(prompt_override):
    templates = []
    prompt_template_str = None

    if prompt_override is not None:
        print ("Prompt Template String override:", prompt_override)
        prompt_template_str = prompt_override
        try:
            prompt_templates = json.loads(prompt_template_str)
            for k, v in prompt_templates.items():
                prompt = v.replace("<br>", "\n")
                templates.append({ k:prompt })
        except:
            prompt = prompt_template_str.replace("<br>", "\n")
            templates.append({
                "Summary": prompt
            })

    if prompt_template_str is None:
        try:
            defaultPromptTemplatesResponse = dynamodb_client.get_item(Key={'LLMPromptTemplateId': {'S': DEFAULT_PROMPT_TEMPLATES_PK}},
                                                               TableName=LLM_PROMPT_TEMPLATE_TABLE_NAME)
            customPromptTemplatesResponse = dynamodb_client.get_item(Key={'LLMPromptTemplateId': {'S': CUSTOM_PROMPT_TEMPLATES_PK}},
                                                               TableName=LLM_PROMPT_TEMPLATE_TABLE_NAME)

            defaultPromptTemplates = defaultPromptTemplatesResponse["Item"]
            customPromptTemplates = customPromptTemplatesResponse["Item"]
            print("Default Prompt Template:", defaultPromptTemplates)
            print("Custom Template:", customPromptTemplates)

            mergedPromptTemplates = {**defaultPromptTemplates, **customPromptTemplates}
            print("Merged Prompt Template:", mergedPromptTemplates)

            for k in sorted(mergedPromptTemplates):
                if (k != "LLMPromptTemplateId" and k != "*Information*"):
                    prompt = mergedPromptTemplates[k]['S']
                    # skip if prompt value is empty, or set to 'NONE'
                    if (prompt and prompt != 'NONE'):
                        prompt = prompt.replace("<br>", "\n")
                        index = k.find('#')
                        k_stripped = k[index+1:]
                        templates.append({ k_stripped:prompt })
        except Exception as e:
            print ("Exception:", e)
            raise (e)

    return templates

def get_transcripts(callId):
    payload = {
        'CallId': callId, 
        'ProcessTranscript': PROCESS_TRANSCRIPT, 
        'TokenCount': TOKEN_COUNT,
        'IncludeSpeaker': True
    }
    print("Invoking lambda", payload)
    response = lambda_client.invoke(
        FunctionName=FETCH_TRANSCRIPT_LAMBDA_ARN,
        InvocationType='RequestResponse',
        Payload=json.dumps(payload)
    )
    print("Lambda response:", response)
    transcript_data = response['Payload'].read().decode()
    transcript_json = json.loads(transcript_data)
    print("Transcript JSON:", transcript_json)
    return transcript_json

def get_request_body(modelId, prompt, max_tokens, temperature):
    provider = modelId.split(".")[0]
    request_body = None
    if provider == "anthropic":
        # claude-3 models use new messages format
        if modelId.startswith("anthropic.claude-3"):
            request_body = {
                "anthropic_version": "bedrock-2023-05-31",
                "messages": [{"role": "user", "content": [{'type': 'text', 'text': prompt}]}],
                "max_tokens": max_tokens,
                "temperature": temperature
            }
        else:
            request_body = {
                "prompt": prompt,
                "max_tokens_to_sample": max_tokens,
                "temperature": temperature
            }
    else:
        raise Exception("Unsupported provider: ", provider)
    return request_body

def get_generated_text(modelId, response):
    provider = modelId.split(".")[0]
    generated_text = None
    response_body = json.loads(response.get("body").read())
    print("Response body: ", json.dumps(response_body))
    if provider == "anthropic":
        # claude-3 models use new messages format
        if modelId.startswith("anthropic.claude-3"):
            generated_text = response_body.get("content")[0].get("text")
        else:
            generated_text = response_body.get("completion")
    else:
        raise Exception("Unsupported provider: ", provider)
    return generated_text

def call_bedrock(prompt_data):
    modelId = BEDROCK_MODEL_ID
    accept = 'application/json'
    contentType = 'application/json'

    body = get_request_body(modelId, prompt_data, max_tokens=512, temperature=0)
    print("Bedrock request - ModelId", modelId, "-  Body: ", body)
    response = bedrock.invoke_model(body=json.dumps(body), modelId=modelId, accept=accept, contentType=contentType)
    generated_text = get_generated_text(modelId, response)
    print("Bedrock response: ", json.dumps(generated_text))
    return generated_text

def generate_summary(transcript, prompt_override):
    # first check to see if this is one prompt, or many prompts as a json
    templates = get_templates_from_dynamodb(prompt_override)
    result = {}
    for item in templates:
        key = list(item.keys())[0]
        prompt = item[key]
        prompt = prompt.replace("{transcript}", transcript)
        print("Prompt:", prompt)
        response = call_bedrock(prompt)
        print("API Response:", response)
        result[key] = response
    if len(result.keys()) == 1:
        # there's only one summary in here, so let's return just that.
        # this may contain json or a string.
        return result[list(result.keys())[0]]
    return json.dumps(result)

def posixify_filename(filename: str) -> str:
    # Replace all invalid characters with underscores
    regex = r'[^a-zA-Z0-9_.]'
    posix_filename = re.sub(regex, '_', filename)
    # Remove leading and trailing underscores
    posix_filename = re.sub(r'^_+', '', posix_filename)
    posix_filename = re.sub(r'_+$', '', posix_filename)
    return posix_filename

def getKBMetadata(metadata):
    # Keys to include
    keys_to_include = ["CallId", "CreatedAt", "UpdatedAt", "Owner", "TotalConversationDurationMillis"]
    # Create a new dictionary with only the specified keys
    filtered_metadata = {key: metadata[key] for key in keys_to_include if key in metadata}
    kbMetadata = {
        "metadataAttributes": filtered_metadata
    }
    return json.dumps(kbMetadata)

def format_summary(summary, metadata):
    summary_dict = json.loads(summary)
    summary_dict["MEETING NAME"]=metadata["CallId"]
    summary_dict["MEETING DATE AND TIME"]=metadata["CreatedAt"]
    summary_dict["MEETING DURATION (SECONDS)"]=int(metadata["TotalConversationDurationMillis"]/1000)
    return json.dumps(summary_dict)

def write_to_s3(callId, metadata, transcript, summary):
    s3 = boto3.client('s3')
    filename = posixify_filename(f"{callId}")
    summary_file_key = f"{S3_PREFIX}{filename}-SUMMARY.txt"
    transcript_file_key = f"{S3_PREFIX}{filename}-TRANSCRIPT.txt"
    summary = format_summary(summary, metadata)
    kbMetadata = getKBMetadata(metadata)
    print(f"KB Summary: {summary}")
    print(f"KB Metadata: {kbMetadata}")
    s3.put_object(Bucket=S3_BUCKET_NAME, Key=summary_file_key, Body=summary)
    print(f"Wrote summary to S3: s3://{S3_BUCKET_NAME}/{summary_file_key}")
    s3.put_object(Bucket=S3_BUCKET_NAME, Key=f"{summary_file_key}.metadata.json", Body=kbMetadata)
    print(f"Wrote summary metadata to S3: s3://{S3_BUCKET_NAME}/{summary_file_key}.metadata.json")
    s3.put_object(Bucket=S3_BUCKET_NAME, Key=transcript_file_key, Body=transcript)
    print(f"Wrote transcript to S3: s3://{S3_BUCKET_NAME}/{transcript_file_key}")
    s3.put_object(Bucket=S3_BUCKET_NAME, Key=f"{transcript_file_key}.metadata.json", Body=kbMetadata)
    print(f"Wrote transcript metadata to S3: s3://{S3_BUCKET_NAME}/{summary_file_key}.metadata.json")

def handler(event, context):
    print("Received event: ", json.dumps(event))
    callId = event['CallId']
    try:
        transcript_json = get_transcripts(callId)
        transcript = transcript_json['transcript']
        metadata = transcript_json['metadata']
        summary = "No summary available"
        prompt_override = None
        if 'Prompt' in event:
            prompt_override = event['Prompt']
        summary = generate_summary(transcript, prompt_override)
        if not prompt_override:
            # only write to S3 when using default summary prompt (eg not invoked via QnABot)
            write_to_s3(callId, metadata, transcript, summary)
    except Exception as e:
        print(e)
        summary = 'An error occurred.'
    print("Returning: ", json.dumps({"summary": summary}))
    return {"summary": summary}
    
# for testing on terminal
if __name__ == "__main__":
    event = {
        "CallId": "8cfc6ec4-0dbe-4959-b1f3-34f13359826b"
    }
    handler(event)

import useSettingsContext from 'contexts/settings';
import { piiTypesSplitRegEx } from './helpers';
import { COMPREHEND_PII_TYPES } from 'components/common/constants';
import { Badge, SpaceBetween, TextContent } from '@awsui/components-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

export const TranscriptContent = ({ segment, translateCache }: any) => {
  const { settings } = useSettingsContext() as any;
  const regex = settings?.CategoryAlertRegex ?? '.*';

  const { transcript, segmentId, channel, targetLanguage, translateOn } = segment;

  const k = segmentId.concat('-', targetLanguage);

  // prettier-ignore
  const currTranslated = translateOn
      && targetLanguage !== ''
      && translateCache[k] !== undefined
      && translateCache[k].translated !== undefined
      ? translateCache[k].translated
      : '';

  const result = currTranslated !== undefined ? currTranslated : '';

  const transcriptPiiSplit = transcript.split(piiTypesSplitRegEx);

  const transcriptComponents = transcriptPiiSplit.map((t: any, i: number) => {
    if (COMPREHEND_PII_TYPES.includes(t)) {
      return <p key={`${segmentId}-pii-${i}`} className="bg-destructive text-white px-2 text-sm rounded-sm w-fit">{`${t}`}</p>;
    }

    let className = '';
    let text = t;
    let translatedText = result;

    switch (channel) {
      case 'AGENT_ASSISTANT':
      case 'MEETING_ASSISTANT':
        className = 'transcript-segment-agent-assist';
        break;
      case 'AGENT':
      case 'CALLER':
        text = text.substring(text.indexOf(':') + 1).trim();
        translatedText = translatedText.substring(translatedText.indexOf(':') + 1).trim();
        break;
      case 'CATEGORY_MATCH':
        if (text.match(regex)) {
          className = 'transcript-segment-category-match-alert';
          text = `Alert: ${text}`;
        } else {
          className = 'transcript-segment-category-match';
          text = `Category: ${text}`;
        }
        break;
      default:
        break;
    }

    return (
      <TextContent key={`${segmentId}-text-${i}`} className={className}>
        <ReactMarkdown rehypePlugins={[rehypeRaw]} className="text-sm font-satoshi font-normal text-gray-600">
          {text.trim()}
        </ReactMarkdown>
        <ReactMarkdown rehypePlugins={[rehypeRaw]} className="text-sm font-satoshi font-normal text-blue-600">
          {translatedText.trim()}
        </ReactMarkdown>
      </TextContent>
    );
  });

  return <div>{transcriptComponents}</div>;
};

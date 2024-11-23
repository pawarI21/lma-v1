import { useCallback, useState } from 'react';
import { DONE_STATUS, IN_PROGRESS_STATUS } from 'components/common/get-recording-status';
import { CallInProgressTranscript } from './CallInProgressTranscript';
import { Container } from '@awsui/components-react';
import CallTranscriptToolbar from './CallTranscriptToolbar';
import { ICallDetails } from 'components/call-list/types';
import { TranslateClient } from '@aws-sdk/client-translate';

interface ICallTranscriptContainer {
  item: ICallDetails;
  callTranscriptPerCallId: any;
  translateClient: TranslateClient;
  enableSentimentAnalysis: boolean;
}

const AGENT_TRANSCRIPT = true;

const getTranscriptContent = ({
  item,
  callTranscriptPerCallId,
  autoScroll,
  translateClient,
  targetLanguage,
  agentTranscript,
  translateOn,
  enableSentimentAnalysis,
}: any) => {
  switch (item.recordingStatusLabel) {
    case DONE_STATUS:
    case IN_PROGRESS_STATUS:
    default:
      return (
        <CallInProgressTranscript
          item={item}
          callTranscriptPerCallId={callTranscriptPerCallId}
          autoScroll={autoScroll}
          translateClient={translateClient}
          targetLanguage={targetLanguage}
          agentTranscript={agentTranscript}
          translateOn={translateOn}
          enableSentimentAnalysis={enableSentimentAnalysis}
        />
      );
  }
};

const CallTranscriptContainer = ({ item, callTranscriptPerCallId, translateClient, enableSentimentAnalysis }: ICallTranscriptContainer) => {
  const [translateOn, setTranslateOn] = useState(false);
  const [autoScroll, setAutoScroll] = useState(item.recordingStatusLabel === IN_PROGRESS_STATUS);
  const [targetLanguage, setTargetLanguage] = useState(localStorage.getItem('targetLanguage') || '');

  const handleLanguageSelect = useCallback(
    (value: string) => {
      setTargetLanguage(value);
      localStorage.setItem('targetLanguage', value);
    },
    [setTargetLanguage],
  );

  return (
    <div>
      <CallTranscriptToolbar
        autoScroll={autoScroll}
        callTranscriptPerCallId={callTranscriptPerCallId}
        item={item}
        setAutoScroll={setAutoScroll}
        handleLanguageSelect={handleLanguageSelect}
        targetLanguage={targetLanguage}
        setTranslateOn={setTranslateOn}
        translateOn={translateOn}
      />
      <div className="px-4">
        {getTranscriptContent({
          item,
          callTranscriptPerCallId,
          autoScroll,
          translateClient,
          targetLanguage,
          AGENT_TRANSCRIPT,
          translateOn,
          enableSentimentAnalysis,
        })}
      </div>
    </div>
  );
};

export default CallTranscriptContainer;

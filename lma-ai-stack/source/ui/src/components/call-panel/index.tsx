import React, { useEffect } from 'react';
import { TranslateClient } from '@aws-sdk/client-translate';
import { Logger } from 'aws-amplify';
import { StandardRetryStrategy } from '@aws-sdk/middleware-retry';

import useSettingsContext from '../../contexts/settings';

import './CallPanel.css';
import useAppContext from '../../contexts/app';
import awsExports from '../../aws-exports';
import CallHeader from './CallHeader';
import { ICallDetails } from 'components/call-list/types';
import NewCallSummary from './CallSummary';
import MeetingRecording from './MeetingRecording';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/ui/tabs';
import CallTranscriptContainer from './CallTranscript/CallTranscriptContainer';
import { GetAgentAssistPanel } from './CallTranscript/getAgentAssistPanel';

interface ICallPanel {
  item: ICallDetails;
  callTranscriptPerCallId: any;
}

const logger = new Logger('CallPanel');
const MAXIMUM_ATTEMPTS = 100;
const MAXIMUM_RETRY_DELAY = 1000;

const CallPanel = ({ item, callTranscriptPerCallId }: ICallPanel) => {
  const { currentCredentials } = useAppContext() as any;
  const { settings } = useSettingsContext() as any;

  const enableSentimentAnalysis = settings?.IsSentimentAnalysisEnabled === 'true';

  // prettier-ignore
  const customRetryStrategy = new StandardRetryStrategy(
      async () => MAXIMUM_ATTEMPTS,
      {
        delayDecider:
          (_, attempts) => Math.floor(
            Math.min(MAXIMUM_RETRY_DELAY, 2 ** attempts * 10),
          ),
      },
    );

  let translateClient = new TranslateClient({
    region: awsExports.aws_project_region,
    credentials: currentCredentials,
    maxAttempts: MAXIMUM_ATTEMPTS,
    retryStrategy: customRetryStrategy,
  });

  /* Get a client with refreshed credentials. Credentials can go stale when user is logged in
       for an extended period.
     */
  useEffect(() => {
    logger.debug('Translate client with refreshed credentials');
    translateClient = new TranslateClient({
      region: awsExports.aws_project_region,
      credentials: currentCredentials,
      maxAttempts: MAXIMUM_ATTEMPTS,
      retryStrategy: customRetryStrategy,
    });
  }, [currentCredentials]);

  return (
    <div>
      <CallHeader data={item} callTranscriptPerCallId={callTranscriptPerCallId} />

      <div className="grid grid-cols-12 gap-4">
        <div className="flex flex-col gap-2 col-span-12 lg:col-span-2 lg:sticky lg:top-[122px] lg:h-screen lg:max-h-[calc(100vh_-_130px)] lg:overflow-x-clip">
          <MeetingRecording item={item} />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <NewCallSummary data={item} />
        </div>
        <div className="flex flex-col gap-2 col-span-12 lg:col-span-4 lg:sticky lg:top-[122px] lg:h-screen lg:max-h-[calc(100vh_-_130px)] lg:overflow-y-auto">
          <div className="border p-2 rounded-lg">
            <Tabs defaultValue="assistBot" className="">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                <TabsTrigger value="assistBot">Assist Bot</TabsTrigger>
              </TabsList>
              <TabsContent value="transcript" forceMount className="hidden data-[state=active]:block">
                <CallTranscriptContainer
                  item={item}
                  callTranscriptPerCallId={callTranscriptPerCallId}
                  translateClient={translateClient}
                  enableSentimentAnalysis={enableSentimentAnalysis}
                />
              </TabsContent>
              <TabsContent value="assistBot" forceMount className="hidden data-[state=active]:block">
                <div>
                  <GetAgentAssistPanel item={item} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallPanel;

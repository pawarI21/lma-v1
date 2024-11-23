export interface ICallDetails {
  callId: string;
  agentId: string;
  callCategories: string | null;
  callCategoryCount: number;
  alertCount: number;
  issuesDetected: string | null;
  callSummaryText: string | null;
  callerPhoneNumber: string;
  systemPhoneNumber: string;
  updatedAt: string;
  recordingUrl: string;
  pcaUrl: string | null;
  totalConversationDurationMillis: number;
  conversationDurationTimeStamp: string;
  conversationDurationInHumanReadableFormat: string;
  sentiment: {
    OverallSentiment: {
      AGENT: string | null;
      CALLER: string | null;
    };
    SentimentByPeriod: {
      QUARTER: {
        AGENT: string | null;
        CALLER: string | null;
      };
    };
  };
  initiationTimeStamp: string;
  recordingStatusLabel: string;
  recordingStatusIcon: string;
  callerAverageSentiment: number;
  callerSentimentLabel: string;
  callerSentimentTrendLabel: string;
  agentAverageSentiment: number;
  agentSentimentLabel: string;
  agentSentimentTrendLabel: string;
  owner: string;
  sharedWith?: string;
  listPK: string;
  listSK: string;
}

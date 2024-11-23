import { ICallDetails } from 'components/call-list/types';
import { downloadTranscriptAsExcel, downloadTranscriptAsText, exportToTextFile } from 'components/common/download-func';
import { getEmailFormattedSummary, getTextFileFormattedMeetingDetails } from 'components/common/summary';

export const handleExportSummaryToTXT = async (data: ICallDetails) => {
  await exportToTextFile(getTextFileFormattedMeetingDetails(data), `Summary-${data.callId}`);
};

export const handleExportSummaryToPDF = (data: ICallDetails) => {};
export const handleExportTranscriptToTXT = async (callTranscriptPerCallId: any, data: ICallDetails) => {
  downloadTranscriptAsText(callTranscriptPerCallId, data);
};
export const handleExportTranscriptToExcel = async (callTranscriptPerCallId: any, data: ICallDetails) => {
  downloadTranscriptAsExcel(callTranscriptPerCallId, data);
};
export const sendToEmail = async (data: ICallDetails) => {
  window.open(`mailto:?subject=${data.callId}&body=${getEmailFormattedSummary(data.callSummaryText)}`);
};

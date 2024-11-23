import React, { useState } from 'react';
import { Avatar, AvatarFallback } from 'components/ui/avatar';
import { ICallDetails } from 'components/call-list/types';
import moment from 'moment';
import { Button } from 'components/ui/button';
import { FileTextIcon, FileUpIcon, MailIcon, Share2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from 'components/ui/dropdown-menu';
import { PiMicrosoftExcelLogo } from 'react-icons/pi';
import { FaRegFilePdf } from 'react-icons/fa6';
import {
  handleExportSummaryToPDF,
  handleExportSummaryToTXT,
  handleExportTranscriptToExcel,
  handleExportTranscriptToTXT,
  sendToEmail,
} from './_helpers';
import useAppContext from 'contexts/app';
import useSettingsContext from 'contexts/settings';
import useCallsContext from 'contexts/calls';
import shareMeetings from 'components/common/share-meeting';
import { Dialog, DialogHeader, DialogContent, DialogDescription, DialogTitle } from 'components/ui/dialog';
import { Input } from 'components/ui/input';
import { Alert, AlertDescription, AlertTitle } from 'components/ui/alert';

interface ICallHeader {
  data: ICallDetails;
  callTranscriptPerCallId: any;
}

const CallHeader = ({ data, callTranscriptPerCallId }: ICallHeader) => {
  const createdDate = moment(data.initiationTimeStamp);
  const updatedAt = moment(data.updatedAt);

  const { currentSession, currentCredentials } = useAppContext() as any;
  const { settings } = useSettingsContext() as any;
  const { calls } = useCallsContext() as any;

  const [share, setShare] = useState(false);
  const [meetingRecipients, setMeetingRecipients] = React.useState('');
  const [submit, setSubmit] = useState(false);
  const [shareResult, setShareResult] = useState<string | null>(null);
  const collectionProps = {
    selectedItems: [data],
  };

  const openShareSettings = () => {
    setShare(true);
  };

  const closeShareSettings = () => {
    setShare(false);
    setMeetingRecipients('');
    setShareResult(null);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmit(true);
    const result = await shareMeetings(calls, collectionProps, meetingRecipients, settings, currentCredentials, currentSession);
    setMeetingRecipients('');
    setShareResult(result);
    setSubmit(false);
  };

  return (
    <div className="flex flex-row gap-2 justify-between pb-4 border-b mb-4 sticky top-12 bg-white z-9">
      <div className="flex flex-row gap-2">
        <Avatar>
          <AvatarFallback className="uppercase">{data?.agentId?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-base">{data.owner}</p>
          <div>
            <p className="text-xs">
              {[
                data.initiationTimeStamp && createdDate.isValid() ? createdDate.format('DD/MM/YYYY, hh:mm') : null,
                data.conversationDurationInHumanReadableFormat,
                data.updatedAt && updatedAt.isValid() ? `Last updated ${updatedAt.fromNow()}` : null,
              ]
                .filter(Boolean)
                .join(', ')}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-row flex-wrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="text-xs leading-none h-7 gap-1 px-2 text-gray-700">
              <FileUpIcon /> Exports
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => handleExportSummaryToTXT(data)}>
                <FileTextIcon /> Export Summary to TXT
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportSummaryToPDF(data)}>
                <FaRegFilePdf className="ml-[2px]" />
                Export Summary to PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportTranscriptToTXT(callTranscriptPerCallId, data)}>
                <FileTextIcon />
                Export Transcript to TXT
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportTranscriptToExcel(callTranscriptPerCallId, data)}>
                <PiMicrosoftExcelLogo />
                Export Transcript to Excel
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" variant="ghost" className="text-xs leading-none h-7 gap-1 px-2 text-gray-700" onClick={() => sendToEmail(data)}>
          <MailIcon /> Email
        </Button>
        <Button size="sm" variant="ghost" className="text-xs leading-none h-7 gap-1 px-2 text-gray-700" onClick={openShareSettings}>
          <Share2 /> Share
        </Button>
      </div>

      <Dialog open={share} onOpenChange={(openStatus) => !openStatus && closeShareSettings()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-4">Share Meeting</DialogTitle>
            <DialogDescription>
              <div>
                <p className="text-sm font-normal mb-3">You are sharing 1 meeting. Enter a comma separated list of email addresses.</p>
              </div>
              <div>
                <form onSubmit={handleSubmit}>
                  <Input
                    value={meetingRecipients}
                    onChange={(event) => setMeetingRecipients(event.target.value)}
                    placeholder="Please enter email..."
                  />
                  {shareResult ? (
                    <Alert className="mt-2 border-cyan-500" variant="default">
                      <AlertTitle className="text-base text-cyan-900">Message</AlertTitle>
                      <AlertDescription className="text-sm text-cyan-800">{shareResult}</AlertDescription>
                    </Alert>
                  ) : null}

                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" type="button" className="ring-red-600 text-red-600 hover:bg-red-50" onClick={closeShareSettings}>
                      Close
                    </Button>
                    <Button variant="outline" disabled={submit || !meetingRecipients.trim()} onClick={handleSubmit}>
                      Submit
                    </Button>
                  </div>
                </form>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CallHeader;

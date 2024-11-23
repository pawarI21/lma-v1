import React from 'react';
import { ICallDetails } from 'components/call-list/types';
import { IN_PROGRESS_STATUS } from 'components/common/get-recording-status';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from 'components/ui/collapsible';
import { FileAudioIcon } from 'lucide-react';
import RecordingPlayer from 'components/recording-player';

interface IMeetingRecording {
  item: ICallDetails;
}

const MeetingRecording = ({ item }: IMeetingRecording) => {
  if (!item?.recordingUrl?.length || item?.recordingStatusLabel === IN_PROGRESS_STATUS) {
    return null;
  }

  return (
    <Collapsible className="w-full border border-slate-200 p-3 bg-white rounded-lg cursor-pointer">
      <CollapsibleTrigger asChild>
        <div className="flex flex-row gap-2 items-center select-none">
          <div className="h-6 w-6 rounded-md bg-slate-100 flex justify-center items-center">
            <FileAudioIcon size={14} className="text-slate-600" />
          </div>
          <p className="text-sm text-slate-600 leading-none">Meeting Recording</p>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent forceMount className="data-[state=closed]:hidden">
        <div className="border-t mt-3 pt-2">
          <RecordingPlayer recordingUrl={item.recordingUrl} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default MeetingRecording;

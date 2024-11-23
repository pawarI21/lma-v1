import React, { useCallback } from 'react';
import { Archive, CircleCheck, FolderPlus, Link2, Mail, Plus, Share2, Share2Icon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ActionButton } from './ActionButton';
import GoogleMeet from 'icons/google-meet';
import Badge from './Badge';
import { Button } from 'components/ui/button';
import { CALLS_PATH } from 'routes/constants';
import { Checkbox } from 'components/ui/checkbox';
import { CheckedState } from '@radix-ui/react-checkbox';
import { ICallDetails } from '../types';

interface ICallCard {
  data: ICallDetails;
  onSelectionChange: (e: any) => void;
  selectedItems: any[];
}

export const CallCard = ({ data, onSelectionChange, selectedItems }: ICallCard) => {
  const handleSelectionChange = useCallback(
    (checked: CheckedState) => {
      if (checked) {
        onSelectionChange({
          cancelable: false,
          defaultPrevented: false,
          cancelBubble: false,
          detail: {
            selectedItems: [...selectedItems, data],
          },
        });
        return;
      }

      onSelectionChange({
        cancelable: false,
        defaultPrevented: false,
        cancelBubble: false,
        detail: {
          selectedItems: selectedItems ? selectedItems.filter((e) => e.callId !== data.callId) : [],
        },
      });
    },
    [selectedItems, onSelectionChange],
  );

  return (
    <Link
      className="block hover:bg-slate-50/30 first-of-type:rounded-t-lg last-of-type:rounded-b-lg border border-b-0 last-of-type:border-b border-slate-200 cursor-pointer"
      to={`${CALLS_PATH}/${data.callId}`}
    >
      <div className="flex flex-row gap-2">
        <div className="w-10 flex justify-center items-center pl-2" onClick={(e) => e.preventDefault()}>
          <Checkbox checked={!!selectedItems.find((e: any) => e.callId === data.callId)} onCheckedChange={handleSelectionChange} />
        </div>
        <div className="flex items-center flex-1 p-2 pl-0">
          <div className="flex-1 flex-col w-full md:pr-0 pr-2 py-1 overflow-x-hidden">
            <p aria-label="Meeting" className="text-base leading-none">
              Meeting
            </p>
            {data.owner ? (
              <p aria-label="Meeting" className="text-xl mb-2">
                {data.owner}
              </p>
            ) : null}
            <div className="flex flex-wrap flew-row w-full gap-2 my-1 content-start items-center">
              <Badge icon={<GoogleMeet />} />
              {data.recordingStatusIcon ? (
                <Badge
                  icon={
                    <div className="flex flex-row items-center justify-center gap-1">
                      <span className="leading-sm text-nowrap text-xs font-medium text-purple-600">Status</span>
                      {data.recordingStatusIcon === 'success' ? <CircleCheck size={14} className="text-green-700" /> : null}
                    </div>
                  }
                />
              ) : null}
              {data.initiationTimeStamp ? (
                <Badge
                  icon={<p className="leading-sm text-nowrap text-xs font-medium text-purple-600">Time: {data.initiationTimeStamp}</p>}
                  className="max-w-max"
                />
              ) : null}
              {data.sharedWith?.length && data.sharedWith.split(',').length ? (
                <Badge
                  icon={
                    <div className="flex flex-row items-center justify-center gap-1">
                      <Share2Icon size={16} />
                      <span>{data.sharedWith.split(',').length}</span>
                    </div>
                  }
                />
              ) : null}
              <Badge icon="✅ 1" />
              {data.conversationDurationInHumanReadableFormat ? (
                <Badge
                  icon={`Duration: ${data.conversationDurationInHumanReadableFormat}`}
                  className="ring-green-700/20 bg-transparent hover:bg-green-100/80 text-green-700"
                />
              ) : null}

              <Button size="sm" variant="ghost" className="h-6 w-6">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <div className="hidden md:flex items-center flex-wrap justify-center md:justify-end min-w-[190px] flex-1 gap-1">
              <div>
                <ActionButton icon={<FolderPlus size={20} />} />
              </div>
              <div>
                <ActionButton icon={<Mail size={20} />} />
              </div>
              <div>
                <ActionButton icon={<Link2 size={20} />} />
              </div>
              <div>
                <ActionButton icon={<Share2 size={20} />} />
              </div>
              <div>
                <ActionButton icon={<Archive size={20} />} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

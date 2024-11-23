import { DONE_STATUS, IN_PROGRESS_STATUS } from 'components/common/get-recording-status';
import { LANGUAGE_CODES } from 'components/common/constants';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from 'components/ui/select';
import { Switch } from 'components/ui/switch';
import { Label } from 'components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from 'components/ui/dropdown-menu';
import { Button } from 'components/ui/button';
import { FileTextIcon, FileUpIcon } from 'lucide-react';
import { handleExportTranscriptToExcel, handleExportTranscriptToTXT } from '../_helpers';
import { PiMicrosoftExcelLogo } from 'react-icons/pi';
import { ICallDetails } from 'components/call-list/types';

interface ICallTranscriptToolbar {
  autoScroll: boolean;
  setAutoScroll: React.Dispatch<React.SetStateAction<boolean>>;
  item: ICallDetails;
  callTranscriptPerCallId: any;
  targetLanguage: string;
  handleLanguageSelect: (value: string) => void;
  translateOn: boolean;
  setTranslateOn: React.Dispatch<React.SetStateAction<boolean>>;
}

const CallTranscriptToolbar = ({
  autoScroll,
  setAutoScroll,
  item,
  callTranscriptPerCallId,
  handleLanguageSelect,
  targetLanguage,
  setTranslateOn,
  translateOn,
}: ICallTranscriptToolbar) => {
  // defaults to auto scroll when call is in progress
  const autoScrollDisabled = item.recordingStatusLabel !== IN_PROGRESS_STATUS;
  const showDownloadTranscript = item.recordingStatusLabel === DONE_STATUS;

  return (
    <div className="flex flex-col md:flex-row gap-2 justify-between pl-2 pr-1 pt-4 mb-4">
      <p className="text-base font-semibold">Meeting Transcript</p>
      <div className="flex flex-wrap gap-2 justify-end">
        <div className="flex items-center space-x-1">
          <Switch
            id="auto-scroll"
            className="w-6 h-4"
            thumbClassName="w-3 h-3 data-[state=checked]:translate-x-2"
            onCheckedChange={(e) => setAutoScroll(e)}
            checked={autoScroll}
            disabled={autoScrollDisabled}
            aria-disabled={autoScrollDisabled}
          />
          <Label className="text-xs" htmlFor="auto-scroll">
            Auto Scroll
          </Label>
        </div>
        <div className="flex items-center space-x-1">
          <Switch
            id="enable-translation"
            className="w-6 h-4"
            thumbClassName="w-3 h-3 data-[state=checked]:translate-x-2"
            onCheckedChange={(e) => setTranslateOn(e)}
            checked={translateOn}
          />
          <Label className="text-xs" htmlFor="enable-translation">
            Enable Translation
          </Label>
        </div>
        {translateOn ? (
          <Select onValueChange={handleLanguageSelect} value={targetLanguage}>
            <SelectTrigger className="w-24 h-7 rounded-md text-xs">
              <SelectValue placeholder={targetLanguage || ''} className="text-xs" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {LANGUAGE_CODES.map(({ value, label }) => (
                  <SelectItem value={value} key={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : null}

        {showDownloadTranscript ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="text-xs leading-none h-7 gap-1 px-2 text-gray-700">
                <FileUpIcon /> Exports
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => handleExportTranscriptToTXT(callTranscriptPerCallId, item)}>
                  <FileTextIcon />
                  Export Transcript to TXT
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportTranscriptToExcel(callTranscriptPerCallId, item)}>
                  <PiMicrosoftExcelLogo />
                  Export Transcript to Excel
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </div>
  );
};

export default CallTranscriptToolbar;

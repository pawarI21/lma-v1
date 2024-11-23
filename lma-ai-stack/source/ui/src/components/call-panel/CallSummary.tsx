import React from 'react';
import { getMarkdownSummary } from 'components/common/summary';
import 'remirror/styles/all.css';

import { BoldExtension, MarkdownExtension } from 'remirror/extensions';
import { Remirror, useRemirror } from '@remirror/react';
import { ICallDetails } from 'components/call-list/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from 'components/ui/dropdown-menu';
import { Button } from 'components/ui/button';
import { CopyIcon, FileTextIcon, FileUpIcon } from 'lucide-react';
import { FaRegFilePdf } from 'react-icons/fa6';
import { handleExportSummaryToPDF, handleExportSummaryToTXT } from './_helpers';

interface ICallSummary {
  data: ICallDetails;
}

const CallSummary = ({ data }: ICallSummary) => {
  const { manager, state } = useRemirror({
    extensions: () => [new BoldExtension({}), new MarkdownExtension({ copyAsMarkdown: false })],
    content: getMarkdownSummary(data.callSummaryText),
    stringHandler: 'markdown',
  });

  return (
    <div className="remirror-theme">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <p className="text-xl font-semibold">Transcript Summary</p>
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
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" variant="ghost" className="text-xs leading-none h-7 gap-1 px-2 text-gray-700">
            <CopyIcon /> Copy
          </Button>
        </div>
      </div>
      {/* the className is used to define css variables necessary for the editor */}
      <Remirror manager={manager} initialContent={state} />
    </div>
  );
};

export default CallSummary;

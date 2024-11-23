import React, { useState } from 'react';
import { useSidebar } from 'components/ui/sidebar';
import { cn } from 'lib/utils';

const MeetingLimitButton = () => {
  const [limitPercentage] = useState('100');
  const { open } = useSidebar();

  return (
    <div className={cn('border-t border-slate-200 delay-1000 transition-opacity duration-1000 opacity-0', open ? 'opacity-100' : 'hidden')}>
      <div className="flex flex-col gap-y-2 px-3 py-2">
        <div className="flex flex-row justify-between" />
        <p className="text-xs">
          <span>You&apos;ve used 0 of your 10 meetings this month.</span>
        </p>
        <div className="w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-1 rounded bg-indigo-600" style={{ width: limitPercentage }} />
        </div>
        <div className="mt-2 w-fit justify-start">
          <button
            type="button"
            className="inline-flex items-center rounded-lg text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap h-fit gap-x-1.5 px-2.5 py-1.5 w-full justify-center text-white font-medium shadow-sm bg-indigo-600 hover:bg-indigo-600/95 focus-visible:outline-indigo-600"
          >
            <span>Upgrade</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingLimitButton;

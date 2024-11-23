import { cn } from 'lib/utils';
import React from 'react';

interface IBadge extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
}

const Badge = ({ icon, className, ...props }: IBadge) => {
  return (
    <div
      className={cn(
        'max-w-[190px] flex items-center justify-center rounded-md font-medium gap-x-1 overflow-ellipsis m-0 px-2 py-1 bg-slate-50 text-xs text-slate-800 ring-1 ring-inset ring-slate-800/10 hover:bg-slate-100',
        className,
      )}
      {...props}
    >
      {icon}
    </div>
  );
};

export default Badge;

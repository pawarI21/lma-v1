import React from 'react';
import { cn } from '../../../lib/utils';

interface IActionButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: any;
}

export const ActionButton = ({ icon, className, ...props }: IActionButton) => {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap w-fit h-fit text-slate-700 rounded-full font-medium hover:bg-slate-100 gap-x-1.5 px-2 py-2',
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
};

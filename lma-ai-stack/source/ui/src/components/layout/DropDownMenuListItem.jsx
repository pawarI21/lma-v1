import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ChevronUpIcon from '../../icons/chevron-up';
import { cn } from '../../lib/utils';

const DropDownMenuListItem = ({ list, icon, title }) => {
  const [isActive, setIsActive] = useState('');

  return (
    <div>
      <button
        type="button"
        className="group relative flex min-h-10 w-full flex-row items-center gap-x-3 rounded-lg p-2 leading-6 hover:bg-slate-50 hover:text-indigo-600 md:bg-none bg-white"
      >
        <div className="inline-flex text-indigo-600">{icon}</div>
        <div className="flex w-full flex-row items-center justify-between gap-x-3 truncate">
          <p className="truncate text-sm font-medium capitalize group-hover:text-slate-700 text-indigo-600">{title}</p>
        </div>
        <ChevronUpIcon />
      </button>
      <ul>
        {list?.map((item) => (
          <li className="relative group">
            <div className="absolute left-[15px] top-4 z-10 mt-[2px] h-full w-px bg-slate-200 group-last-of-type:hidden" />
            <Link
              onClick={() => setIsActive(item.href)}
              to={item.href}
              className={cn(
                'group relative flex h-10 items-center rounded-lg px-2 py-2 text-sm hover:bg-slate-50',
                isActive === item.href ? 'bg-slate-50 text-indigo-600' : 'text-slate-700',
              )}
            >
              <span className="relative flex h-4 w-4 flex-shrink-0 items-center justify-center" aria-hidden="true">
                <span
                  className={cn(
                    isActive === item.href ? 'bg-indigo-500' : 'bg-slate-200',
                    'relative z-20 block h-[6px] w-[6px] rounded-full text-indigo-500',
                  )}
                />
              </span>
              <div className="flew-row flex items-center gap-x-3">
                <p className={cn('ml-4 flex min-w-0 flex-col truncate capitalize', isActive === item.href ? 'text-indigo-600' : 'text-slate-700')}>
                  {item.title}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DropDownMenuListItem;

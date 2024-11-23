import React from 'react';
import useAppContext from '../../contexts/app';

const SidebarFooter = () => {
  const { user } = useAppContext();
  const userId = user?.attributes?.email || 'user';
  const userName = user?.username || 'User Name';

  return (
    <div className="justify-start px-4 pb-6 pt-1 md:mt-2 md:pb-0 md:pt-0">
      <button
        type="button"
        className="inline-flex items-center rounded-lg text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap h-fit font-semibold bg-white hover:bg-slate-100 gap-x-1.5 px-3 py-2 w-full justify-center text-slate-700"
      >
        <div className="mr-auto flex gap-2.5">
          <img
            className="h-9 w-9 rounded-full"
            alt={userName}
            src="https://lh3.googleusercontent.com/a/ACg8ocIKhdqQR667pjFco8bSDdf6F9F7U6XF2JrGT0JIbo1_etCQ4pE=s96-c"
          />
          <div className="flex flex-col">
            <div className="max-w-[150px] overflow-hidden text-ellipsis text-sm capitalize">{userName}</div>
            <div className="max-w-[150px] overflow-hidden text-ellipsis text-xs font-normal">{userId}</div>
          </div>
        </div>
      </button>
    </div>
  );
};

export default SidebarFooter;

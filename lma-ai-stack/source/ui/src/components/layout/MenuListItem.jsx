import React from 'react';
import { Link } from 'react-router-dom';

const MenuListItem = ({ href, icon, title }) => {
  return (
    <Link
      className="group relative flex min-h-10 w-full flex-row items-center gap-x-3 rounded-lg p-2 leading-6 hover:bg-slate-50 hover:text-slate-700 md:bg-none"
      to={href}
    >
      <div className="inline-flex text-slate-400">{icon}</div>
      <div className="flex-1 cursor-pointer overflow-hidden">
        <div className="flex flex-row items-center gap-x-3">
          <p className="truncate text-left text-sm font-medium capitalize text-slate-700">{title}</p>
        </div>
      </div>
    </Link>
  );
};

export default MenuListItem;

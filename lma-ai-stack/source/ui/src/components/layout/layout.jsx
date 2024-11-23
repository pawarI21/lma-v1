import React from 'react';
import HashIcon from '../../icons/hash';
import MenuIcon from '../../icons/menu';
import MenuListItem from './MenuListItem';
import DropDownMenuListItem from './DropDownMenuListItem';
import Settings2Icon from '../../icons/settings2';
import AddToChromeButton from './AddToChromeButton';
import MeetingLimitButton from './MeetingLimitButton';
import SidebarFooter from './SidebarFooter';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col pl-0 md:pl-64 md:bg-white md:h-screen md:box-border">
      <nav className="flex max-w-full w-full h-auto fixed z-20 md:z-auto bg-white left-0 md:w-64 md:h-full border-b border-slate-200 md:border-r md:border-slate-200  overflow-x-hidden overflow-y-auto flex-col gap-3">
        <div className="flex grow flex-col gap-y-3 overflow-y-auto bg-transparent px-6">
          <div className="flex items-center justify-between md:justify-start p-0 md:pt-3 ">
            <a className="font-3xl py-3 md:flex-none md:px-0 md:py-0" href="#/">
              <img className="w-[106px] h-[43px]" src="/Tactiq-BsaT7wLV.svg" alt="Tactiq Logo" />
            </a>
            <button
              type="button"
              aria-label="toggle"
              className="flex justify-center rounded-lg w-10 h-10 items-center text-2xl hover:border md:hidden"
            >
              <MenuIcon />
            </button>
          </div>
          <div className="flex-col color-[#474665] gap-y-0.5 -mx-2 content-center bg-transparent cursor-pointer [&>svg]:w-6 hidden md:flex">
            <MenuListItem href="#/transcripts" icon={<HashIcon />} title="My Meetings" />
            <MenuListItem href="#/shared-with-me" icon={<HashIcon />} title="Shared With Me" />
            <DropDownMenuListItem
              icon={<Settings2Icon />}
              title="Account &amp; Settings"
              list={[
                {
                  href: '',
                  title: 'Settings',
                  key: '1',
                },
                {
                  href: '',
                  title: 'Billing',
                  key: '2',
                },
                {
                  href: '',
                  title: 'Team',
                  key: '3',
                },
                {
                  href: '',
                  title: 'Integrations',
                  key: '4',
                },
              ]}
            />
          </div>
        </div>
        <div className="flex-col gap-1 md:pb-4 hidden md:flex">
          <AddToChromeButton />
          <MeetingLimitButton />
          <SidebarFooter />
        </div>
      </nav>

      <div className="mx-auto flex w-full flex-col p-6 pt-20 lg:p-12">
        <div></div>
        {children}
      </div>
    </div>
  );
};

export default Layout;

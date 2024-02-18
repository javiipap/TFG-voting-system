import Link from 'next/link';
import React from 'react';
import { BellIcon, Package2Icon, PlusIcon } from './components/icons';
import { AsideNav } from './components/AsideNav';

export default function Aside() {
  return (
    <aside className="hidden lg:flex flex-col h-full gap-2 border-r dark:border-gray-950 bg-gray-100 dark:bg-gray-800">
      <div className="flex h-14 lg:h-[60px] items-center border-b dark:border-gray-950 px-6">
        <Link href="#" className="flex items-center gap-2 font-semibold">
          <Package2Icon className="w-6 h-6 dark:text-gray-300" />
          <span className="dark:text-gray-100">Voting sys</span>
        </Link>
        <div className="border dark:border-gray-950 ml-auto h-8 w-8 flex items-center justify-center rounded-md">
          <BellIcon className="h-4 w-4 dark:text-gray-100" />
        </div>
      </div>
      <AsideNav />
      <div className="mx-8 py-2 dark:text-gray-100">
        <Link
          href="#"
          className="group flex items-center justify-between px-3 py-3 hover:bg-black dark:hover:bg-gray-900 hover:text-white dark:hover:text-gray-100 rounded-lg transition-all bg-gray-100 dark:bg-gray-800 dark:text-gray-100"
        >
          Create
          <PlusIcon className="h-6 w-6 dark:fill-gray-100 group-hover:fill-white transition-all" />
        </Link>
      </div>
    </aside>
  );
}

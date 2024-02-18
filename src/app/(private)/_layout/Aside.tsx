import Link from 'next/link';
import React from 'react';
import { BellIcon, Package2Icon, PlusIcon } from './components/icons';
import { AsideNav } from './components/AsideNav';

export default function Aside() {
  return (
    <aside className="hidden lg:flex flex-col h-full gap-2 border-r dark:border-neutral-800 bg-neutral-100 dark:bg-black">
      <div className="flex h-14 lg:h-[60px] items-center border-b dark:border-neutral-800 px-6">
        <Link
          href="#"
          className="flex items-center gap-2 font-semibold h-full overflow-hidden"
        >
          <Package2Icon className="w-6 h-6 dark:text-neutral-300" />
          <span className="dark:text-neutral-100 w-[80%] text-ellipsis">
            Lorem ipsum
          </span>
        </Link>
        <div className="border dark:border-neutral-800 ml-auto h-8 w-8 flex items-center justify-center rounded-md">
          <BellIcon className="h-4 w-4 dark:text-neutral-100" />
        </div>
      </div>
      <AsideNav />
      <div className="mx-8 py-2 dark:text-neutral-100">
        <Link
          href="#"
          className="group flex items-center justify-between px-3 py-3 mb-1 hover:bg-black dark:hover:bg-neutral-700 hover:text-white dark:hover:text-neutral-100 rounded-lg transition-all bg-neutral-100 dark:bg-black dark:text-neutral-100"
        >
          Create
          <PlusIcon className="h-6 w-6 dark:fill-neutral-100 group-hover:fill-white transition-all" />
        </Link>
      </div>
    </aside>
  );
}

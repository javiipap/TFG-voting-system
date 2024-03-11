import Link from 'next/link';
import React from 'react';
import { BellIcon, Package2Icon } from './components/icons';
import { AsideNav } from './components/AsideNav';
import { SheetTrigger } from '@/components/ui/sheet';
import Button from '@/components/Button';
import { PlusIcon } from 'lucide-react';

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
      <div className="flex justify-center items-center py-4">
        <div>
          <SheetTrigger asChild>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Create election
            </Button>
          </SheetTrigger>
        </div>
      </div>
    </aside>
  );
}

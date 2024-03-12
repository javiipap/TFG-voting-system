import React from 'react';
import { AsideNav } from './components/AsideNav';
import { SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

export default function Aside() {
  return (
    <aside className="hidden lg:flex flex-col h-full gap-2 border-r dark:border-neutral-800 bg-neutral-100 dark:bg-black">
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

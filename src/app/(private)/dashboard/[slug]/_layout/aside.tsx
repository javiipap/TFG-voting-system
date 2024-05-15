'use client';

import React, { useContext } from 'react';
import { AsideNav } from '@/app/(private)/dashboard/[slug]/_layout/components/AsideNav';
import { SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { deployContractAction } from '@/app/(private)/dashboard/[slug]/_layout/actions';
import { useToast } from '@/components/ui/use-toast';
import { Context } from '@/app/(private)/dashboard/[slug]/context';

export default function Aside() {
  const { id, candidates, startDate } = useContext(Context) as Context;
  const { toast } = useToast();
  const { execute, status } = useAction(deployContractAction, {
    onSuccess: () => {
      toast({
        title: 'Election contract deployed succesfully',
      });
    },
    onError: (e) => {
      console.log(e);
      toast({
        title: e.serverError || 'Unkown validation error',
      });
    },
  });

  return (
    <aside className="hidden lg:flex flex-col h-full gap-2 border-r dark:border-neutral-800 bg-neutral-100 dark:bg-black">
      <AsideNav />
      <div className="flex justify-center items-stretch flex-col py-4 space-y-2 px-4">
        {startDate >= new Date() ? (
          <Button
            variant={'secondary'}
            disabled={status === 'executing'}
            onClick={() =>
              execute({
                id,
                candidateCount: candidates.length,
              })
            }
          >
            Deploy
          </Button>
        ) : (
          ''
        )}
        <SheetTrigger asChild>
          <Button>
            <PlusIcon className="w-4 h-4 mr-2" />
            Create another
          </Button>
        </SheetTrigger>
      </div>
    </aside>
  );
}

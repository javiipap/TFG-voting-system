'use client';

import { Button } from '@/components/ui/button';
import { ChevronsUpDown, Package2Icon } from 'lucide-react';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Link from 'next/link';
import * as schema from '@/db/schema';
import { useParams } from 'next/navigation';

export default function Title({
  ballots,
}: {
  ballots: (typeof schema.ballots.$inferSelect)[];
}) {
  const params = useParams();

  return (
    <div className="w-[280px] px-6 border-r flex items-center relative">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="flex items-center w-full">
            <Package2Icon className="w-6 h-6 mr-2" />
            <span className="font-semibold flex-1 text-left text-ellipsis">
              {params.slug
                ? ballots.find((bl) => bl.slug === params.slug)?.name
                : 'Select Ballot'}
            </span>
            <ChevronsUpDown className="h-4 w-4 justify-self-end" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="px-2">
          <div className="flex flex-col space-y-2">
            {ballots.map((ballot) => (
              <PopoverClose key={`header_ballot_${ballot.id}`} asChild>
                <Link
                  href={`/dashboard/${ballot.slug}`}
                  className="text-sm py-2 px-2 rounded-md hover:bg-primary/5"
                >
                  {ballot.name}
                </Link>
              </PopoverClose>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

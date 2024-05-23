'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Vote } from 'lucide-react';
import { candidates as Candidates } from '@/db/schema';
import { useState } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function SelectCandidate({
  candidates,
  onChange,
  submitDisabled,
}: {
  candidates: (typeof Candidates.$inferSelect)[];
  onChange: (selected: number) => void;
  submitDisabled?: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="">
      <ScrollArea className="whitespace-nowrap">
        <div className="flex space-x-4 items-center justify-center pb-4 w-max">
          {candidates.map((candidate, i) => (
            <Card
              key={`candidate-${i}`}
              className={`hover:bg-foreground/5 transition-all cursor-pointer shrink-0 ${
                selected === i ? 'bg-foreground/10' : ''
              }`}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setSelected(i);
                }}
              >
                <CardHeader className="flex-row items-center gap-4">
                  <Avatar>
                    <AvatarImage
                      src={candidate.img || ''}
                      alt={candidate.name}
                    />
                    <AvatarFallback>{candidate.name[0]}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-left">{candidate.name}</CardTitle>
                </CardHeader>
              </button>
            </Card>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="pt-4 relative">
        <Button
          className="px-8"
          onClick={() => onChange(selected!)}
          disabled={typeof selected !== 'number' || submitDisabled}
        >
          <Vote className="mr-2" />
          Vota
        </Button>
      </div>
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Vote } from 'lucide-react';
import { candidates as Candidates } from '@/db/schema';
import { useState } from 'react';

export default function SelectCandidate({
  candidates,
  onChange,
}: {
  candidates: (typeof Candidates.$inferSelect)[];
  onChange: (selected: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="">
      <div className="flex gap-4">
        {candidates.map((candidate, i) => (
          <Card
            key={`candidate-${i}`}
            className={`hover:bg-foreground/5 transition-all cursor-pointer ${
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
                  <AvatarImage src={candidate.img || ''} alt={candidate.name} />
                  <AvatarFallback>{candidate.name[0]}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-left">{candidate.name}</CardTitle>
              </CardHeader>
            </button>
          </Card>
        ))}
      </div>
      <div className="pt-4">
        <Button
          className="px-8"
          onClick={() => onChange(selected!)}
          disabled={typeof selected !== 'number'}
        >
          <Vote className="mr-2" />
          Vota
        </Button>
      </div>
    </div>
  );
}

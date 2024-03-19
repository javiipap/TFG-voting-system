'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Vote } from 'lucide-react';
import { getCandidates } from '@/db/helpers';
import { Session } from 'next-auth';
import { useState } from 'react';

export default function SelectCandidate({
  candidates,
  session,
}: {
  candidates: Awaited<ReturnType<typeof getCandidates>>;
  session: Session | null;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="">
      <div className="flex gap-4">
        {candidates.map(({ candidates }, i) => (
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
                  <AvatarImage
                    src={candidates.img || ''}
                    alt={candidates.name}
                  />
                  <AvatarFallback>{candidates.name[0]}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-left">{candidates.name}</CardTitle>
              </CardHeader>
            </button>
          </Card>
        ))}
      </div>
      {!!session && (
        <form className="pt-4">
          <input
            type="hidden"
            name="candidate"
            value={selected ? candidates[selected].candidates.id : undefined}
          />
          <Button className="px-8">
            <Vote className="mr-2" />
            Vota
          </Button>
        </form>
      )}
    </div>
  );
}

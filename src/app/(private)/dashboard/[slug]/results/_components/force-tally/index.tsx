'use client';

import { Button } from '@/components/ui/button';
import { forceTallyAction } from '@/app/(private)/dashboard/[slug]/results/_components/force-tally/actions';
import { useContext } from 'react';
import { Context } from '@/app/(private)/dashboard/[slug]/context';
import { useAction } from 'next-safe-action/hooks';

export default function ForceTally() {
  const { slug, id: electionId } = useContext(Context) as Context;
  const { execute, status } = useAction(forceTallyAction);

  const onClick = () => execute({ slug, electionId });

  return (
    <Button onClick={onClick} disabled={status === 'executing'}>
      Retrieve results
    </Button>
  );
}

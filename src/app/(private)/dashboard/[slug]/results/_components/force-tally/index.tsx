'use client';

import { Button } from '@/components/ui/button';
import { forceTallyAction } from '@/app/(private)/dashboard/[slug]/results/_components/force-tally/actions';
import { useContext } from 'react';
import { Context } from '@/app/(private)/dashboard/[slug]/context';
import { useAction } from 'next-safe-action/hooks';
import LoadingButton from '@/components/loading-button';

export default function ForceTally() {
  const { slug, id: electionId } = useContext(Context) as Context;
  const { execute, status } = useAction(forceTallyAction);

  const onClick = () => execute({ slug, electionId });

  return (
    <LoadingButton onClick={onClick} disabled={status === 'executing'}>
      Retrieve results
    </LoadingButton>
  );
}

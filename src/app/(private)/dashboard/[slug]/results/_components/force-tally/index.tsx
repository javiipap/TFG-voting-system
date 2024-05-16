'use client';

import { Button } from '@/components/ui/button';
import { forceTallyAction } from '@/app/(private)/dashboard/[slug]/results/_components/force-tally/actions';
import { useContext } from 'react';
import { Context } from '@/app/(private)/dashboard/[slug]/context';

export default function ForceTally() {
  const { slug, id: electionId } = useContext(Context) as Context;

  const onClick = async () => {
    await forceTallyAction({ slug, electionId });
  };

  return <Button onClick={onClick}>Retrieve results</Button>;
}

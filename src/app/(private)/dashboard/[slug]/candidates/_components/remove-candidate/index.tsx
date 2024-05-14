'use client';

import { Button } from '@/components/ui/button';
import { removeCandidateAction } from '@/app/(private)/dashboard/[slug]/candidates/_components/remove-candidate/actions';
import { useContext } from 'react';
import { Context } from '@/app/(private)/dashboard/[slug]/context';
import { useAction } from 'next-safe-action/hooks';
import { useToast } from '@/components/ui/use-toast';

export default function DeleteCandidate({
  id,
  name,
}: {
  id: number;
  name: string;
}) {
  const { id: electionId, slug } = useContext(Context) as Context;
  const { toast } = useToast();
  const { execute, status } = useAction(removeCandidateAction, {
    onSuccess: () => {
      toast({
        title: `Deleted ${name} successfully`,
      });
    },
    onError: (e) => {
      toast({
        title: e.serverError || 'Unkonwn error',
      });
    },
  });

  return (
    <Button
      variant="link"
      className="px-0 text-red-500"
      disabled={status === 'executing'}
      onClick={() => execute({ id, slug, electionId })}
    >
      Delete
    </Button>
  );
}

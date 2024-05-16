'use client';

import { Context } from '@/app/(private)/dashboard/[slug]/context';
import { unAuthorizeUserAction } from '@/app/(private)/dashboard/[slug]/voters/_components/unauthorize-voter/actions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAction } from 'next-safe-action/hooks';
import { useContext } from 'react';

export default function DeleteVoter({ userId }: { userId: number }) {
  const { toast } = useToast();
  const { execute, status } = useAction(unAuthorizeUserAction, {
    onError: (e) => {
      toast({ title: e.serverError || 'Unkown error' });
    },
  });
  const { slug, id: electionId } = useContext(Context) as Context;

  return (
    <Button
      variant="link"
      className="text-red-600 px-0"
      onClick={() => execute({ userId, electionId, slug })}
      disabled={status === 'executing'}
    >
      Delete
    </Button>
  );
}

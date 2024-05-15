'use client';

import { Button } from '@/components/ui/button';
import { deleteGroupAction } from '@/app/(private)/dashboard/groups/_components/actions';
import { useAction } from 'next-safe-action/hooks';
import { useToast } from '@/components/ui/use-toast';

export default function DeleteGroup({ id }: { id: number }) {
  const { toast } = useToast();
  const { execute } = useAction(deleteGroupAction, {
    onSuccess: () => {
      toast({ title: 'Deleted group successfully' });
    },
    onError: (e) => {
      toast({ title: e.serverError || 'Unknown while deleting group' });
    },
  });

  return (
    <Button
      variant="link"
      className="text-red-600"
      onClick={() => execute({ id })}
    >
      Delete
    </Button>
  );
}

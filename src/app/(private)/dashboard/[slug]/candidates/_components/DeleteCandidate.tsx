'use client';

import { Button } from '@/components/ui/button';
import { submitDeleteCandidate } from '../_actions';

export default function DeleteCandidate({
  slug,
  id,
}: {
  slug: string;
  id: number;
}) {
  return (
    <Button
      variant="link"
      className="px-0 text-red-500"
      onClick={async () => await submitDeleteCandidate(slug, id)}
    >
      Delete
    </Button>
  );
}

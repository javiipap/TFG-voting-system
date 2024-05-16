'use server';

import { schema } from '@/app/(private)/dashboard/[slug]/results/_components/decrypt-form/validation';
import { updateCandidateVotes } from '@/data-access/candidates';
import { authenticatedAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';

export const storeClearResultsAction = authenticatedAction(
  schema,
  async ({ candidates, slug }) => {
    await Promise.all(
      candidates.map(({ id, votes }) => updateCandidateVotes(id, votes))
    );

    revalidatePath(`/dashboard/${slug}/results`);
  }
);

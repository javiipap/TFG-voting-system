'use server';

import { deleteCandidate } from '@/db/helpers';
import { authenticatedElectionAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';
import { schema } from '@/app/(private)/dashboard/[slug]/candidates/_components/remove-candidate/validation';

export const removeCandidateAction = authenticatedElectionAction(
  schema,
  async ({ slug, id }) => {
    await deleteCandidate(id);

    revalidatePath(`/dashboard/${slug}/candidates`, 'page');
  }
);

'use server';

import { authenticatedElectionAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';
import { schema } from '@/app/(private)/dashboard/[slug]/candidates/_components/add-candidate/validation';
import { addCandidate } from '@/data-access/candidates';

export const addCandidateAction = authenticatedElectionAction(
  schema,
  async ({ name, description, electionId, slug }) => {
    await addCandidate({ electionId, name, description });

    revalidatePath(`/dashboard/${slug}/candidates`, 'page');
  }
);

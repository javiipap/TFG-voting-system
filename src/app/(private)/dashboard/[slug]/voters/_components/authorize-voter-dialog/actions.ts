'use server';

import { schema } from '@/app/(private)/dashboard/[slug]/voters/_components/authorize-voter-dialog/validation';
import { authorizeUser } from '@/data-access/elections';
import { authenticatedElectionAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';

export const authorizeUserAction = authenticatedElectionAction(
  schema,
  async ({ electionId, email, slug }) => {
    await authorizeUser(email, electionId);
    revalidatePath(`/dashboard/${slug}/voters`);
  }
);

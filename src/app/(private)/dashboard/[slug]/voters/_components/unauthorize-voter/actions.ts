'use server';

import { schema } from '@/app/(private)/dashboard/[slug]/voters/_components/unauthorize-voter/validation';
import { unAuthorizeUser } from '@/data-access/elections';
import { authenticatedElectionAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';

export const unAuthorizeUserAction = authenticatedElectionAction(
  schema,
  async ({ electionId, userId, slug }) => {
    await unAuthorizeUser(userId, electionId);

    revalidatePath(slug);
  }
);

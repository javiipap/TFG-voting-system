'use server';

import { schema } from '@/app/(private)/dashboard/[slug]/groups/validations';
import { linkGroupToElection } from '@/db/helpers';
import { authenticatedElectionAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';

export const authorizeGroupAction = authenticatedElectionAction(
  schema,
  async ({ slug, electionId, groupId }) => {
    await linkGroupToElection(electionId, parseInt(groupId));

    revalidatePath(`/dashboard/${slug}/groups`);
  }
);

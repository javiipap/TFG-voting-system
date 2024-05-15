'use server';

import { ActionError, authenticatedAction } from '@/lib/safe-action';
import { schema } from '@/app/(private)/dashboard/[slug]/_layout/validation';
import { forceExecution } from '@/lib/scheduler';
import { createReference } from '@/jobs/deploy-contract';
import { revalidatePath } from 'next/cache';
import { getElection } from '@/data-access/election';

export const deployContractAction = authenticatedAction(
  schema,
  async ({ candidateCount, id }, { user }) => {
    const election = await getElection(id);

    if (election?.adminId !== user.adminId) {
      throw new ActionError("User isn't authorized to edit this election");
    }

    if (candidateCount < 1) {
      throw new ActionError('There must be at least one candidate.');
    }

    await forceExecution(createReference({ electionId: id }));
    revalidatePath(`/dashboard/${election.slug}`, 'layout');
  }
);

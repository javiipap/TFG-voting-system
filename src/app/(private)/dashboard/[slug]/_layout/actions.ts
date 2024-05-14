'use server';

import { ActionError, authenticatedAction } from '@/lib/safe-action';
import { schema } from '@/app/(private)/dashboard/[slug]/_layout/validation';
import { elections } from '@/db/schema';
import { execQuery } from '@/db/helpers';
import { and, eq } from 'drizzle-orm';
import { forceExecution } from '@/lib/scheduler';
import { createReference } from '@/jobs/deploy-contract';

export const deployContractAction = authenticatedAction(
  schema,
  async ({ candidateCount, id, masterPublicKey }, { user }) => {
    const election = await execQuery((db) =>
      db.query.elections.findFirst({
        where: and(eq(elections.adminId, user.adminId), eq(elections.id, id)),
      })
    );

    if (!election) {
      throw new ActionError("User isn't authorized to edit this election");
    }

    if (candidateCount < 1) {
      throw new ActionError('There must be at least one candidate.');
    }

    await forceExecution(createReference({ electionId: id }));
  }
);

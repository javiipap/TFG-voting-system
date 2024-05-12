'use server';

import { ActionError, authenticatedAction } from '@/lib/safe-action';
import { schema } from '../_layout/validation';
import { deployContract } from '@/background/deployContract';
import { elections } from '@/db/schema';
import { execQuery } from '@/db/helpers';
import { and, eq } from 'drizzle-orm';

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

    await deployContract(candidateCount, id, masterPublicKey);
  }
);

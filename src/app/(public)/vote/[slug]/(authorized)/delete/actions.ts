'use server';

import { schema } from '@/app/(public)/vote/[slug]/delete/validation';
import { ActionError, authenticatedAction } from '@/lib/safe-action';
import { Web3 } from 'web3';
import { env } from '@/env';
import { execQuery } from '@/db/helpers';
import { votes } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export const requestDeleteAction = authenticatedAction(
  schema,
  async ({ address, token, electionId }, { user }) => {
    const vote = await execQuery((db) =>
      db.query.votes.findFirst({
        where: and(
          eq(votes.electionId, electionId),
          eq(votes.userId, parseInt(user.id!))
        ),
      })
    );

    if (!vote) {
      throw new ActionError("User hasn't voted");
    }

    const web3 = new Web3(env.NEXT_PUBLIC_ETH_HOST);
    const expectedAddress = web3.eth.accounts.recover(
      token,
      vote.signedEthSecret
    );

    if (address !== expectedAddress) {
      throw new ActionError("Account don't match");
    }

    await execQuery((db) =>
      db
        .delete(votes)
        .where(
          and(
            eq(votes.electionId, electionId),
            eq(votes.userId, parseInt(user.id!))
          )
        )
    );
  }
);

'use server';

import { schema } from '@/app/(public)/vote/[slug]/(authorized)/delete/validation';
import { ActionError, authenticatedAction } from '@/lib/safe-action';
import { execQuery } from '@/db/helpers';
import { votes, elections } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { ecc_decrypt } from 'server_utilities';
import { callContract } from '@/lib/call-contract';
import { env } from '@/env';
import { Web3 } from 'web3';

export const requestDeleteAction = authenticatedAction(
  schema,
  async ({ sk, electionId }, { user }) => {
    const election = await execQuery((db) =>
      db.query.elections.findFirst({ where: eq(elections.id, electionId) })
    );

    if (!election) {
      throw new ActionError("Election doesent't exist");
    }

    const vote = await execQuery((db) =>
      db.query.votes.findFirst({
        where: and(
          eq(votes.electionId, electionId),
          eq(votes.userId, user.userId)
        ),
      })
    );

    if (!vote) {
      throw new ActionError("User hasn't voted");
    }

    const expectedSk = Buffer.from(
      ecc_decrypt(
        Buffer.from(sk.slice(2), 'hex'),
        Buffer.from(vote.encryptedEthSecret, 'base64')
      )
    ).toString('hex');

    if (sk !== '0x' + expectedSk) {
      throw new ActionError("Account don't match");
    }

    const addr = new Web3().eth.accounts.privateKeyToAccount(sk).address;

    await callContract(
      env.ETH_ACCOUNT,
      env.ETH_PRIV,
      election.contractAddr || '',
      'revoke',
      addr
    );

    await execQuery((db) =>
      db
        .delete(votes)
        .where(
          and(eq(votes.electionId, electionId), eq(votes.userId, user.userId))
        )
    );
  }
);

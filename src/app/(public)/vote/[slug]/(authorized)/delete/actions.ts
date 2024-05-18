'use server';

import { schema } from '@/app/(public)/vote/[slug]/(authorized)/delete/validation';
import { ActionError, authenticatedAction } from '@/lib/safe-action';
import { ecc_decrypt } from 'server_utilities';
import { callContract } from '@/lib/utils/call-contract';
import { env } from '@/env';
import { Web3 } from 'web3';
import { deleteBallot, getBallot, getElection } from '@/data-access/elections';

export const requestDeleteAction = authenticatedAction(
  schema,
  async ({ sk, electionId }, { user }) => {
    const election = await getElection(electionId);

    if (!election) {
      throw new ActionError("Election doesent't exist");
    }

    const ballot = await getBallot(electionId, user.userId);

    if (!ballot) {
      throw new ActionError("User hasn't voted");
    }

    const expectedSk = Buffer.from(
      ecc_decrypt(
        Buffer.from(sk.slice(2), 'hex'),
        Buffer.from(ballot.encryptedEthSecret, 'base64')
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

    await deleteBallot(electionId, user.userId);
  }
);

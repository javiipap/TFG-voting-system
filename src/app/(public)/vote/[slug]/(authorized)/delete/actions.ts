'use server';

import { schema } from '@/app/(public)/vote/[slug]/(authorized)/delete/validation';
import { ActionError, authenticatedAction } from '@/lib/safe-action';
import { callContractWithNonce } from '@/lib/ethereum/call-contract';
import { deleteBallot, getBallot, getElection } from '@/data-access/elections';
import { ethVerify } from '@/lib/ethereum';
import { getAccount } from '@/data-access/accounts';
import { encodeMetadata } from '@/app/(public)/vote/[slug]/(authorized)/previous/_lib';

export const requestDeleteAction = authenticatedAction(
  schema,
  async ({ electionId, signature, publicKey, address }, { user }) => {
    const election = await getElection(electionId);

    if (!election) {
      throw new ActionError("Election doesent't exist");
    }

    const ballot = await getBallot(electionId, user.userId);

    if (!ballot) {
      throw new ActionError("User hasn't voted");
    }

    const msg = await encodeMetadata([]);

    const result = ethVerify(msg, signature, Buffer.from(publicKey, 'base64'));

    if (!result) {
      throw new ActionError('Verification failed');
    }

    const account = await getAccount(false);

    if (!account) {
      throw new Error("Couldn't retrieve admin ETH account");
    }

    await callContractWithNonce(
      account.addr,
      account.privateKey,
      election.contractAddr || '',
      'revoke',
      account.nonce,
      address
    );

    await deleteBallot(electionId, user.userId);
  }
);

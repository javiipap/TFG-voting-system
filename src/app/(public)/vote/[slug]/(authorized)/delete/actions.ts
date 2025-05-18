'use server';

import { schema } from '@/app/(public)/vote/[slug]/(authorized)/delete/validation';
import { ActionError, authenticatedAction } from '@/lib/safe-action';
import { ecc_decrypt } from 'server_utilities';
import { callContractWithNonce } from '@/lib/ethereum/call-contract';
import { deleteBallot, getBallot, getElection } from '@/data-access/elections';
import { privateKeyToAddress } from '@/lib/ethereum';
import { getAccount } from '@/data-access/accounts';

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

    const addr = privateKeyToAddress(sk);

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
      addr
    );

    await deleteBallot(electionId, user.userId);
  }
);

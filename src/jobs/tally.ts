import { callContractWithNonce } from '@/lib/ethereum/call-contract';
import { getElection, setResult } from '@/data-access/elections';
import { getAccount } from '@/data-access/accounts';
import { contractGetter } from '@/lib/ethereum/contract-getter';

export function createReference({ electionId }: { electionId: number }) {
  return `tally_${electionId}`;
}

export async function handler({ electionId }: { electionId: number }) {
  const election = await getElection(electionId);

  if (!election) {
    throw new Error(`Election ${electionId} doesn't exist`);
  }

  if (!election.contractAddr) {
    throw new Error(`Election ${electionId} hasn't been deployed`);
  }

  const account = await getAccount(false);

  if (!account) {
    throw new Error("Couldn't retrieve admin ETH account");
  }

  await callContractWithNonce(
    account.addr,
    account.privateKey,
    election.contractAddr,
    'tally',
    account.nonce
  );

  const result = await contractGetter(election.contractAddr, 'result_');

  if (!result) {
    throw new Error('Unexpected error while retrieving result');
  }

  const DELTA = 5 * 60 * 1000;

  const endDate =
    Math.abs(new Date().getTime() - election.endDate.getTime()) <= DELTA
      ? election.endDate
      : new Date();

  await setResult(electionId, result, endDate);
}

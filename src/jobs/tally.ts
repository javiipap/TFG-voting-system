import { env } from '@/env';
import { callContract } from '@/lib/call-contract';
import { getElection } from '@/data-access/elections';

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

  await callContract(
    env.ETH_ACCOUNT,
    env.ETH_PRIV,
    election.contractAddr,
    'tally'
  );
}

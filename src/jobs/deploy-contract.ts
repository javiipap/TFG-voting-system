import { getCandidates } from '@/data-access/candidates';
import { getElection, startElection } from '@/data-access/elections';
import { deployContract } from '@/lib/ethereum/deploy-contract';

export function createReference({ electionId }: { electionId: number }) {
  return `deploy-contract_${electionId}`;
}

export async function handler({ electionId }: { electionId: number }) {
  const election = await getElection(electionId);
  if (!election) {
    throw new Error(`Election ${electionId} doesn't exist`);
  }

  const candidates = await getCandidates(electionId);

  if (candidates.length < 1) {
    throw new Error(`Election ${electionId} has no candidates`);
  }

  const contractAddress = await deployContract(
    candidates,
    electionId.toString(),
    election.masterPublicKey
  );

  if (!contractAddress) {
    throw new Error(`Couldn\'t deploy contract for ${electionId}`);
  }

  const DELTA = 5 * 60 * 1000;

  const startDate =
    Math.abs(new Date().getTime() - election.startDate.getTime()) <= DELTA
      ? election.startDate
      : new Date();

  await startElection(contractAddress, startDate, electionId);
}

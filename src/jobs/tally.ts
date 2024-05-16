import { env } from '@/env';
import { callContract } from '@/lib/call-contract';
import { getElection, setResult } from '@/data-access/elections';
import { Web3 } from 'web3';
import { getContractInfo } from '@/lib/get-contract-info';

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

  const web3 = new Web3(env.NEXT_PUBLIC_ETH_HOST);
  const { abi } = await getContractInfo();
  const contract = new web3.eth.Contract(abi, election.contractAddr);

  const result = (await contract.methods.result_().call()) as string;

  if (!result) {
    throw new Error('Unexpected error while retrieving result');
  }

  await setResult(electionId, result);
}

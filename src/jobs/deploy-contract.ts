import { env } from '@/env';
import Web3 from 'web3';
import { getCandidates } from '@/data-access/candidates';
import { getContractInfo } from '@/lib/utils/get-contract-info';
import { getElection, startElection } from '@/data-access/elections';

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

  const web3 = new Web3(env.NEXT_PUBLIC_ETH_HOST);

  const { abi, byteCode } = await getContractInfo();

  const contract = new web3.eth.Contract(abi);

  const encodedABI = contract
    .deploy({
      data: byteCode,
      arguments: [
        candidates.length,
        electionId.toString(),
        election.masterPublicKey,
      ],
    })
    .encodeABI();

  const gasPrice = Math.ceil(Number(await web3.eth.getGasPrice()) * 1.4);

  const gas = await web3.eth.estimateGas({
    from: env.ETH_ACCOUNT,
    data: encodedABI,
    gasPrice,
  });

  const signed = await web3.eth.accounts.signTransaction(
    {
      from: env.ETH_ACCOUNT,
      data: encodedABI,
      gas,
      gasPrice,
    },
    env.ETH_PRIV
  );

  const receipient = await web3.eth.sendSignedTransaction(
    signed.rawTransaction
  );

  const DELTA = 5 * 60 * 1000;

  const startDate =
    Math.abs(new Date().getTime() - election.startDate.getTime()) <= DELTA
      ? election.startDate
      : new Date();

  await startElection(receipient.contractAddress!, startDate, electionId);
}

import { callContract } from '@/lib/ethereum/call-contract';

export async function submitVote(
  ballot: string,
  contractAddr: string,
  clientAddr: string,
  clientPriv: string
) {
  const receipient = await callContract(
    clientAddr,
    clientPriv,
    contractAddr,
    'vote',
    ballot
  );

  return {
    blockNumber: receipient.blockNumber,
    blockHash: receipient.blockHash,
  };
}

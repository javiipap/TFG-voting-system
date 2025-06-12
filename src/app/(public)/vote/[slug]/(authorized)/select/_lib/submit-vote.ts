import { callContract } from '@/lib/ethereum/call-contract';

export async function submitVote(
  ballot: Buffer,
  contractAddr: string,
  clientAddr: string,
  clientPriv: string,
  iat: number,
  ticket: Buffer
) {
  console.log(iat);
  const receipient = await callContract(
    clientAddr,
    clientPriv,
    contractAddr,
    'vote',
    ballot,
    iat,
    ticket
  );

  return {
    blockNumber: receipient.blockNumber,
    blockHash: receipient.blockHash,
  };
}

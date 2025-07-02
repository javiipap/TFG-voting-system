import { getEthNode } from '@/lib/ethereum/get-eth-node';
import { Web3 } from 'web3';

export async function calculateGas2(candidateCount: number) {
  const web3 = new Web3(getEthNode());
  const basePrice = 262000;
  const candidateCost = 114115;

  const gasPrice = BigInt(1000000);

  return gasPrice * BigInt(basePrice + candidateCost * candidateCount);
}

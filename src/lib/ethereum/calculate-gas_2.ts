import { getEthNode } from '@/lib/ethereum/get-eth-node';
import { Web3 } from 'web3';

export async function calculateGas2(candidateCount: number) {
  const web3 = new Web3(getEthNode());
  const basePrice = 262000;
  const candidateCost = 114115;

  const gasPrice = BigInt(Math.ceil(Number(await web3.eth.getGasPrice()) * 2));

  return gasPrice * BigInt(basePrice + candidateCost * candidateCount);
}

import { getContractInfo } from '@/lib/utils/get-contract-info';
import { env } from '@/env';
import { Web3 } from 'web3';
import { encryptVote } from 'server_utilities';

export async function calculateGas(
  publicKey: Buffer,
  candidateCount: number,
  contractAddr: string,
  clientAddr: string
) {
  const web3 = new Web3(env.NEXT_PUBLIC_ETH_HOST);

  const { abi } = await getContractInfo();

  var mySmartContract = new web3.eth.Contract(abi, contractAddr);

  const ballot = encryptVote(publicKey, 0, candidateCount);

  const gas = await mySmartContract.methods
    .vote(ballot)
    .estimateGas({ from: clientAddr });

  const gasPrice = BigInt(
    Math.ceil(Number(await web3.eth.getGasPrice()) * 1.4)
  );

  const finalGas = gasPrice * gas;

  return finalGas;
}

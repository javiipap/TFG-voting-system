import { getContractInfo } from '@/lib/ethereum/get-contract-info';
import { Web3 } from 'web3';
import { encryptVote } from 'server_utilities';
import { getEthNode } from '@/lib/ethereum/get-eth-node';

export async function calculateGas(
  publicKey: Buffer,
  ticket: Buffer,
  iat: number,
  candidateCount: number,
  contractAddr: string,
  clientAddr: string
) {
  const web3 = new Web3(getEthNode());

  const { abi } = await getContractInfo();

  const electionContract = new web3.eth.Contract(abi, contractAddr);

  const ballot = encryptVote(publicKey, 0, candidateCount);

  const gas = await electionContract.methods
    .vote(ballot, iat, ticket)
    .estimateGas({ from: clientAddr });

  console.log(`GAS: ${gas}`);

  const gasPrice = BigInt(Math.ceil(Number(await web3.eth.getGasPrice()) * 2));

  const finalGas = gasPrice * gas;

  return finalGas;
}

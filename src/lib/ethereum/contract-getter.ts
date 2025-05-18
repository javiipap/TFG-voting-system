import { getContractInfo } from '@/lib/ethereum/get-contract-info';
import { getEthNode } from '@/lib/ethereum/get-eth-node';
import Web3 from 'web3';

export async function contractGetter(contractAddr: string, attribute: string) {
  const web3 = new Web3(getEthNode());
  const { abi } = await getContractInfo();
  const contract = new web3.eth.Contract(abi, contractAddr);

  return (await contract.methods[attribute]().call()) as string;
}

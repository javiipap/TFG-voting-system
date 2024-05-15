import { getContractInfo } from '@/lib/get-contract-info';
import { env } from '@/env';
import { Web3 } from 'web3';

export async function callContract(
  senderAddr: string,
  senderPriv: string,
  contractAddr: string,
  methodName: string,
  ...args: any[]
) {
  const web3 = new Web3(env.NEXT_PUBLIC_ETH_HOST);

  const { abi } = await getContractInfo();

  var mySmartContract = new web3.eth.Contract(abi, contractAddr);

  const gasPrice = Math.ceil(Number(await web3.eth.getGasPrice()) * 1.4);

  const gas = await mySmartContract.methods[methodName](...args).estimateGas({
    from: senderAddr,
  });
  console.log(`expected gas: ${gas}`);

  const encodedABI = mySmartContract.methods[methodName](...args).encodeABI();

  const signed = await web3.eth.accounts.signTransaction(
    {
      from: senderAddr,
      to: contractAddr,
      data: encodedABI,
      gasPrice,
      gas,
    },
    senderPriv
  );

  return await web3.eth.sendSignedTransaction(signed.rawTransaction);
}

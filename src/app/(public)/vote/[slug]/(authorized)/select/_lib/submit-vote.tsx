import { env } from '@/env';
import Web3 from 'web3';

export async function submitVote(
  ballot: string,
  contractAddr: string,
  clientAddr: string,
  clientPriv: string
) {
  const web3 = new Web3(env.NEXT_PUBLIC_ETH_HOST);

  const req = await fetch('/contracts/bin/abi.json');

  const abi = await req.json();

  var mySmartContract = new web3.eth.Contract(abi, contractAddr);

  const gasPrice = Math.ceil(Number(await web3.eth.getGasPrice()) * 1.4);

  const gas = await mySmartContract.methods
    .vote(ballot)
    .estimateGas({ from: clientAddr });
  console.log(`expected gas: ${gas}`);

  const encodedABI = mySmartContract.methods.vote(ballot).encodeABI();

  const signed = await web3.eth.accounts.signTransaction(
    {
      from: clientAddr,
      to: contractAddr,
      data: encodedABI,
      gasPrice,
      gas,
    },
    clientPriv
  );

  const receipient = await web3.eth.sendSignedTransaction(
    signed.rawTransaction
  );

  return {
    blockNumber: receipient.blockNumber,
    blockHash: receipient.blockHash,
  };
}

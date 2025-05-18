import { getContractInfo } from '@/lib/ethereum/get-contract-info';
import { Web3 } from 'web3';
import { getEthNode } from '@/lib/ethereum/get-eth-node';
import { retry } from '@/lib/utils';

export async function callContractWithNonce(
  senderAddr: string,
  senderPriv: string,
  contractAddr: string,
  methodName: string,
  nonce: number,
  ...args: any[]
) {
  const web3 = new Web3(getEthNode());

  const { abi } = await getContractInfo();

  var mySmartContract = new web3.eth.Contract(abi, contractAddr);

  return await retry(async () => {
    const gasPrice = Math.ceil(Number(await web3.eth.getGasPrice()) * 1.4);

    const gas = await mySmartContract.methods[methodName](...args).estimateGas({
      from: senderAddr,
    });
    console.log(`expected gas: ${Number(gas) * gasPrice}`);

    const encodedABI = mySmartContract.methods[methodName](...args).encodeABI();

    const currentNonce =
      nonce === -1
        ? await web3.eth.getTransactionCount(senderAddr, 'pending')
        : nonce;

    const signed = await web3.eth.accounts.signTransaction(
      {
        from: senderAddr,
        to: contractAddr,
        data: encodedABI,
        gasPrice,
        gas,
        nonce: currentNonce,
      },
      senderPriv
    );

    return await web3.eth.sendSignedTransaction(signed.rawTransaction);
  }, 10);
}

export async function callContract(
  senderAddr: string,
  senderPriv: string,
  contractAddr: string,
  methodName: string,
  ...args: any[]
) {
  return await callContractWithNonce(
    senderAddr,
    senderPriv,
    contractAddr,
    methodName,
    -1,
    ...args
  );
}

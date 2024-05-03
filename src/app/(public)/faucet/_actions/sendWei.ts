import { env } from '@/env';
import { Transaction, Web3 } from 'web3';

export async function sendWei(clientAddr: string, wei: bigint) {
  const web3 = new Web3(env.NEXT_PUBLIC_ETH_HOST);

  const gasPrice = Math.ceil(Number(await web3.eth.getGasPrice()) * 1.4);

  const gas = await web3.eth.estimateGas({
    from: env.ETH_ACCOUNT,
    to: clientAddr,
    gasPrice,
  });

  const transaction: Transaction = {
    from: env.ETH_ACCOUNT,
    to: clientAddr,
    value: wei,
    gasPrice,
    gas,
  };

  const signed = await web3.eth.accounts.signTransaction(
    transaction,
    env.ETH_PRIV
  );

  await web3.eth.sendSignedTransaction(signed.rawTransaction);
}

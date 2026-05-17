import { getEip1559Fees } from '@/lib/ethereum';
import { getEthNode } from '@/lib/ethereum/get-eth-node';
import { Numbers, Web3 } from 'web3';

interface Transaction {
  from: string;
  nonce: number;
  to?: string;
  data?: string;
  value?: Numbers;
}

export const executeAdminTransaction = async (
  transaction: Transaction,
  privateKey: string,
) => {
  const web3 = new Web3(getEthNode());
  web3.eth.transactionBlockTimeout = 250;
  const { maxFeePerGas, maxPriorityFeePerGas } = await getEip1559Fees();

  const signed = await web3.eth.accounts.signTransaction(
    {
      ...transaction,
      maxFeePerGas: maxFeePerGas.toString(),
      maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
    },
    privateKey,
  );

  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      return await web3.eth.sendSignedTransaction(signed.rawTransaction);
    } catch (err: any) {
      const msg = err?.cause?.message ?? err?.data ?? err?.message ?? '';
      if (msg.includes('transaction indexing is in progress')) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Transaction indexing did not complete after retries');
};

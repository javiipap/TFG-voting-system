import { PRIORITY_FEE_PER_GAS } from '@/lib/ethereum';
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

  const signed = await web3.eth.accounts.signTransaction(
    {
      ...transaction,
      gasPrice: PRIORITY_FEE_PER_GAS.toString(),
    },
    privateKey,
  );

  return await web3.eth.sendSignedTransaction(signed.rawTransaction);
};

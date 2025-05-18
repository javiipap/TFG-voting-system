import { getContractInfo } from '@/lib/ethereum/get-contract-info';
import { Web3 } from 'web3';
import { getEthNode } from '@/lib/ethereum/get-eth-node';
import { getAccount } from '@/data-access/accounts';
import { executeAdminTransaction } from '@/lib/ethereum/execute-admin-transaction';

export const grantPermissions = async (
  clientAddr: string,
  contractAddr: string
) => {
  const web3 = new Web3(getEthNode());

  const { abi } = await getContractInfo();

  const electionContract = new web3.eth.Contract(abi, contractAddr);

  const account = await getAccount(false);

  if (!account) {
    throw Error('Error accesing ETH admin account');
  }

  const encodedABI = electionContract.methods.grant(clientAddr).encodeABI();

  await executeAdminTransaction(
    {
      from: account.addr,
      to: contractAddr,
      data: encodedABI,
    },
    account.privateKey
  );
};

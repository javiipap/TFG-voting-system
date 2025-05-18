import { getAccount } from '@/data-access/accounts';
import { executeAdminTransaction } from '@/lib/ethereum/execute-admin-transaction';
import { getContractInfo } from '@/lib/ethereum/get-contract-info';
import { getEthNode } from '@/lib/ethereum/get-eth-node';
import { Web3 } from 'web3';

export async function deployContract(
  candidates: any[],
  electionId: string,
  publicKey: Buffer,
  rsaPublicKey: Buffer
) {
  const web3 = new Web3(getEthNode());

  const { abi, byteCode } = await getContractInfo();

  const contract = new web3.eth.Contract(abi);

  const encodedABI = contract
    .deploy({
      data: byteCode,
      arguments: [candidates.length, electionId, publicKey, rsaPublicKey],
    })
    .encodeABI();

  const account = await getAccount(false);

  if (!account) {
    throw new Error("Couldn't retrieve ETH admin account");
  }

  return (
    await executeAdminTransaction(
      {
        from: account.addr,
        data: encodedABI,
        nonce: account.nonce,
      },
      account.privateKey
    )
  ).contractAddress;
}

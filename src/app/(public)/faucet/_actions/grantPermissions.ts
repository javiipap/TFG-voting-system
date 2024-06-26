import { getContractInfo } from '@/lib/utils/get-contract-info';
import { env } from '@/env';
import { Web3 } from 'web3';

export const grantPermissions = async (
  clientAddr: string,
  contractAddr: string
) => {
  const web3 = new Web3(env.NEXT_PUBLIC_ETH_HOST);

  const { abi } = await getContractInfo();

  const electionContract = new web3.eth.Contract(abi, contractAddr);

  const gasPrice = Math.ceil(Number(await web3.eth.getGasPrice()) * 1.4);

  const gas = await electionContract.methods
    .grant(clientAddr)
    .estimateGas({ from: env.ETH_ACCOUNT });

  const encodedABI = electionContract.methods.grant(clientAddr).encodeABI();

  const signed = await web3.eth.accounts.signTransaction(
    {
      from: env.ETH_ACCOUNT,
      to: contractAddr,
      data: encodedABI,
      gasPrice,
      gas,
    },
    env.ETH_PRIV
  );

  await web3.eth.sendSignedTransaction(signed.rawTransaction);
};

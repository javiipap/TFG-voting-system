import { env } from '@/env';
import Web3 from 'web3';
import { readFileSync } from 'fs';
import { execQuery } from '@/db/helpers';
import { elections } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getContractInfo() {
  const abi = JSON.parse(
    readFileSync(process.cwd() + '/public/contracts/bin/abi.json').toString()
  );

  const byteCode = readFileSync(
    process.cwd() + '/public/contracts/bin/bytecode'
  ).toString();

  return {
    abi,
    byteCode,
  };
}

export async function deployContract(
  candidateCount: number,
  id: number,
  masterPublicKey: string
) {
  const web3 = new Web3(env.NEXT_PUBLIC_ETH_HOST);

  const { abi, byteCode } = await getContractInfo();

  const contract = new web3.eth.Contract(abi);

  const encodedABI = contract
    .deploy({
      data: byteCode,
      arguments: [candidateCount, id.toString(), masterPublicKey],
    })
    .encodeABI();

  const gasPrice = Math.ceil(Number(await web3.eth.getGasPrice()) * 1.4);

  const gas = await web3.eth.estimateGas({
    from: env.ETH_ACCOUNT,
    data: encodedABI,
    gasPrice,
  });

  const signed = await web3.eth.accounts.signTransaction(
    {
      from: env.ETH_ACCOUNT,
      data: encodedABI,
      gas,
      gasPrice,
    },
    env.ETH_PRIV
  );

  const receipient = await web3.eth.sendSignedTransaction(
    signed.rawTransaction
  );

  await execQuery((db) =>
    db
      .update(elections)
      .set({ contractAddr: receipient.contractAddress })
      .where(eq(elections.id, id))
  );
}

import { HttpProvider, Web3 } from 'web3';
import { getContractInfo } from '@/lib/ethereum/get-contract-info';
import { PRIORITY_FEE_PER_GAS } from '@/lib/ethereum';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const config = JSON.parse(
  readFileSync(resolve(__dirname, 'benchmark.config.json'), 'utf-8'),
);
const ETH_NODE = process.argv[3] || config.rpcEndpoints[0];
const ADMIN_KEY = config.tallyAdminKey;

const web3 = new Web3(new HttpProvider(ETH_NODE));

async function main() {
  if (process.argv.length < 3) {
    console.error('invoke-tally.ts <contractAddr>');
    process.exit(1);
  }

  const contractAddr = process.argv[2];
  const { abi } = await getContractInfo();
  const contract = new web3.eth.Contract(abi, contractAddr);
  const adminAddr = web3.eth.accounts.privateKeyToAccount(ADMIN_KEY).address;

  const t0 = performance.now();

  const encodedABI = contract.methods['tally']().encodeABI();
  const gas = await contract.methods['tally']().estimateGas({ from: adminAddr });
  const nonce = await web3.eth.getTransactionCount(adminAddr, 'pending');

  const signed = await web3.eth.accounts.signTransaction(
    {
      from: adminAddr,
      to: contractAddr,
      data: encodedABI,
      gasPrice: PRIORITY_FEE_PER_GAS.toString(),
      gas,
      nonce,
    },
    ADMIN_KEY,
  );

  const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
  const wallTimeMs = performance.now() - t0;

  console.log(
    JSON.stringify({
      gasUsed: Number(receipt.gasUsed),
      wallTimeMs,
      blockNumber: Number(receipt.blockNumber),
    }),
  );
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

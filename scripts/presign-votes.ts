/**
 * presign-votes.ts — Preparation phase worker.
 *
 * For each credential: grants ETH, waits for balance, encrypts ballot,
 * and signs the vote transaction. Outputs pre-signed raw transactions.
 *
 * Usage: npx tsx presign-votes.ts <publicKey> <contractAddr> <candidateCount> <credentialsFile> <primaryEndpoint> [fallbackEndpointsJson]
 */
import { HttpProvider, Web3 } from 'web3';
import { encryptVote } from '@/lib/pkg/server_utilities';
import { getContractInfo } from '@/lib/ethereum/get-contract-info';
import { PRIORITY_FEE_PER_GAS } from '@/lib/ethereum';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const config = JSON.parse(
  readFileSync(resolve(__dirname, 'benchmark.config.json'), 'utf-8'),
);
const CONCURRENCY: number = config.webConcurrency ?? config.concurrency ?? 200;
const PRIMARY_ENDPOINT = process.argv[6] || config.rpcEndpoints[0];
const FALLBACK_ENDPOINTS: string[] = process.argv[7]
  ? JSON.parse(process.argv[7])
  : config.rpcEndpoints.filter((e: string) => e !== PRIMARY_ENDPOINT);
const WEB_ADDR = config.webAddr;

function createWeb3(endpoint: string): Web3 {
  const web3 = new Web3(new HttpProvider(endpoint));
  web3.eth.transactionBlockTimeout = 250;
  return web3;
}

let web3 = createWeb3(PRIMARY_ENDPOINT);

const mp = async <T>(callback: () => Promise<T>) => {
  const init = performance.now();
  const output = await callback();
  const time = performance.now() - init;
  return { time, output };
};

const mpSync = <T>(callback: () => T) => {
  const init = performance.now();
  const output = callback();
  const time = performance.now() - init;
  return { time, output };
};

async function requestEth(
  clientAddr: string,
  publicKey: string,
  ticket: Buffer,
  iat: number,
  candidateCount: number,
  contractAddr: string,
) {
  const result = await fetch(`${WEB_ADDR}/api/testing/grant`, {
    method: 'POST',
    body: JSON.stringify({
      publicKey,
      candidateCount,
      contractAddr,
      clientAddr,
      ticket: ticket.toString('base64'),
      iat,
    }),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!result.ok) throw new Error(`Grant failed: HTTP ${result.status}`);
}

async function waitForBalance(addr: string, timeoutMs = 60000) {
  const start = Date.now();
  const endpoints = [PRIMARY_ENDPOINT, ...FALLBACK_ENDPOINTS];
  let endpointIdx = 0;

  while (Date.now() - start < timeoutMs) {
    try {
      const balance = await web3.eth.getBalance(addr);
      if (balance > BigInt(0)) return;
    } catch (e: any) {
      // On error, try next endpoint
      endpointIdx = (endpointIdx + 1) % endpoints.length;
      if (endpoints[endpointIdx] !== PRIMARY_ENDPOINT) {
        web3 = createWeb3(endpoints[endpointIdx]);
      }
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timeout waiting for balance on ${addr}`);
}

async function presignOne(
  publicKey: string,
  contractAddr: string,
  candidateCount: number,
  ticketData: any,
) {
  const {
    ticket: { addr, iat },
    privateKey,
    signature: encodedSignature,
  } = ticketData;
  const signature = Buffer.from(encodedSignature, 'base64');

  const { time: grantTime } = await mp(() =>
    requestEth(addr, publicKey, signature, iat, candidateCount, contractAddr),
  );

  await waitForBalance(addr);

  const selected = Math.floor(Math.random() * candidateCount);
  const { time: encryptTime, output: ballot } = mpSync(() =>
    encryptVote(Buffer.from(publicKey, 'base64'), selected, candidateCount),
  );

  const { abi } = await getContractInfo();
  const contract = new web3.eth.Contract(abi, contractAddr);
  const encodedABI = contract.methods.vote(ballot, iat, signature).encodeABI();

  const block = await web3.eth.getBlock('latest');
  const baseFee = BigInt(block.baseFeePerGas ?? 0);
  const maxFeePerGas = baseFee * 2n + PRIORITY_FEE_PER_GAS;

  const signed = await web3.eth.accounts.signTransaction(
    {
      from: addr,
      to: contractAddr,
      data: encodedABI,
      maxFeePerGas: maxFeePerGas.toString(),
      maxPriorityFeePerGas: PRIORITY_FEE_PER_GAS.toString(),
    },
    privateKey,
  );

  return {
    status: 'fulfilled',
    rawTx: signed.rawTransaction,
    voterAddress: addr,
    grantTime,
    encryptTime,
  };
}

function determinePhase(err: any): string {
  const msg = (err?.message ?? '') + (err?.stack ?? '');
  if (msg.includes('grant') || msg.includes('Grant')) return 'grant';
  if (msg.includes('balance') || msg.includes('Timeout waiting'))
    return 'balanceWait';
  if (msg.includes('encrypt')) return 'encrypt';
  if (msg.includes('sign')) return 'sign';
  return 'unknown';
}

async function main() {
  const argv = process.argv;
  if (argv.length < 6) {
    console.error(
      'presign-votes.ts <publicKey> <contractAddr> <candidateCount> <credentialsFile> [rpcEndpoint]',
    );
    return;
  }

  const publicKey = argv[2];
  const contractAddr = argv[3];
  const candidateCount = Number(argv[4]);
  const credentialsFile = argv[5];

  const credentials: any[] = JSON.parse(readFileSync(credentialsFile, 'utf-8'));

  console.error(
    `Presigning ${credentials.length} votes (concurrency=${CONCURRENCY}, primary=${PRIMARY_ENDPOINT}, fallbacks=${FALLBACK_ENDPOINTS.length})...`,
  );

  const results: any[] = new Array(credentials.length);
  let idx = 0;

  async function runNext(): Promise<void> {
    while (idx < credentials.length) {
      const i = idx++;
      try {
        results[i] = await presignOne(
          publicKey,
          contractAddr,
          candidateCount,
          credentials[i],
        );
      } catch (err: any) {
        results[i] = {
          status: 'rejected',
          voterAddress: credentials[i]?.ticket?.addr || 'unknown',
          failedPhase: determinePhase(err),
          error: err?.message ?? String(err),
        };
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, credentials.length) }, () =>
      runNext(),
    ),
  );

  console.log(JSON.stringify(results));
}

main().then();

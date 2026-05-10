/**
 * emit-votes.ts — Emission phase worker.
 *
 * Submits pre-signed vote transactions and measures per-vote latency
 * and inclusion delay.
 *
 * Usage: npx tsx emit-votes.ts <inputFile> <primaryEndpoint> [fallbackEndpointsJson]
 */
import { HttpProvider, Web3 } from 'web3';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const config = JSON.parse(
  readFileSync(resolve(__dirname, 'benchmark.config.json'), 'utf-8'),
);
const CONCURRENCY: number = config.concurrency ?? 200;
const PRIMARY_ENDPOINT = process.argv[3] || config.rpcEndpoints[0];
const FALLBACK_ENDPOINTS: string[] = process.argv[4] 
  ? JSON.parse(process.argv[4])
  : config.rpcEndpoints.filter((e: string) => e !== PRIMARY_ENDPOINT);

function createWeb3(endpoint: string): Web3 {
  const web3 = new Web3(new HttpProvider(endpoint));
  web3.eth.transactionBlockTimeout = 250;
  return web3;
}

let web3 = createWeb3(PRIMARY_ENDPOINT);

interface TxEntry {
  rawTx: string;
  voterAddress: string;
}

function classifyError(msg: string): string {
  if (msg.includes('ECONNRESET') || msg.includes('ECONNREFUSED') || msg.includes('socket hang up'))
    return 'connection';
  if (msg.includes('timeout') || msg.includes('ETIMEDOUT')) return 'timeout';
  if (msg.includes('already known')) return 'already_known';
  if (msg.includes('reverted') || msg.includes('revert')) return 'evm_revert';
  return 'other';
}

async function emitOne(entry: TxEntry) {
  const submitTimestamp = Date.now();
  const t0 = performance.now();
  
  const endpoints = [PRIMARY_ENDPOINT, ...FALLBACK_ENDPOINTS];
  let lastError: any;
  
  for (const endpoint of endpoints) {
    try {
      if (endpoint !== PRIMARY_ENDPOINT) {
        web3 = createWeb3(endpoint);
      }
      const receipt = await web3.eth.sendSignedTransaction(entry.rawTx);
      const latencyMs = performance.now() - t0;

      const block = await web3.eth.getBlock(receipt.blockNumber);
      const inclusionDelayMs = Number(block.timestamp) * 1000 - submitTimestamp;

      return {
        status: 'fulfilled',
        voterAddress: entry.voterAddress,
        latencyMs,
        inclusionDelayMs,
        gas: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber.toString(),
      };
    } catch (e: any) {
      lastError = e;
    }
  }
  
  return {
    status: 'rejected',
    voterAddress: entry.voterAddress,
    error: lastError?.message ?? String(lastError),
    errorType: classifyError(lastError?.message ?? ''),
  };
}

async function main() {
  const argv = process.argv;
  if (argv.length < 3) {
    console.error('emit-votes.ts <inputFile> [rpcEndpoint]');
    return;
  }

  const inputFile = argv[2];
  const txs: TxEntry[] = JSON.parse(readFileSync(inputFile, 'utf-8'));

  console.error(
    `Emitting ${txs.length} votes (concurrency=${CONCURRENCY}, primary=${PRIMARY_ENDPOINT}, fallbacks=${FALLBACK_ENDPOINTS.length})...`,
  );

  const results: any[] = new Array(txs.length);
  let idx = 0;

  async function runNext(): Promise<void> {
    while (idx < txs.length) {
      const i = idx++;
      results[i] = await emitOne(txs[i]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, txs.length) }, () => runNext()),
  );

  const successful = results.filter((r) => r.status === 'fulfilled').length;
  console.error(`  Done: ${successful}/${txs.length} successful`);

  console.log(JSON.stringify(results));
}

main().then();

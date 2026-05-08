/**
 * emit-votes.ts — Emission phase worker.
 *
 * Submits pre-signed vote transactions and measures per-vote latency
 * and inclusion delay.
 *
 * Usage: npx tsx emit-votes.ts <inputFile> [rpcEndpoint]
 */
import { HttpProvider, Web3 } from 'web3';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const config = JSON.parse(
  readFileSync(resolve(__dirname, 'benchmark.config.json'), 'utf-8'),
);
const CONCURRENCY: number = config.concurrency ?? 200;
const ETH_NODE = process.argv[3] || config.rpcEndpoints[0];

const web3 = new Web3(new HttpProvider(ETH_NODE));
web3.eth.transactionBlockTimeout = 250;

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
  try {
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
    return {
      status: 'rejected',
      voterAddress: entry.voterAddress,
      error: e?.message ?? String(e),
      errorType: classifyError(e?.message ?? ''),
    };
  }
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
    `Emitting ${txs.length} votes (concurrency=${CONCURRENCY}, rpc=${ETH_NODE})...`,
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

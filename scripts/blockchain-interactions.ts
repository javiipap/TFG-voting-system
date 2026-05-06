import { HttpProvider, Web3 } from 'web3';
import { encryptVote } from '@/lib/pkg/server_utilities';

import { getContractInfo } from '@/lib/ethereum/get-contract-info';
import { PRIORITY_FEE_PER_GAS } from '@/lib/ethereum';
import { readFileSync } from 'fs';

const ETH_NODES = [...new Array(8)].map(
  (_, i) => `http://e3vote-worker0${i + 1}.iaas.ull.es:30545`,
);
const ETH_NODE = ETH_NODES[Math.floor(Math.random() * 0)];
const WEB_ADDR = 'http://localhost:3000';

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

import http from 'http';
const agent = new http.Agent({ keepAlive: false });

const web3 = new Web3(
  new Web3(
    new HttpProvider(ETH_NODE, {
      providerOptions: {
        headers: { Connection: 'close' },
        keepalive: false,
      },
    }),
  ),
);

export async function callContract(
  senderAddr: string,
  senderPriv: string,
  contractAddr: string,
  methodName: string,
  ...args: any[]
) {
  const { abi } = await getContractInfo();

  var mySmartContract = new web3.eth.Contract(abi, contractAddr);

  // return await retry(async () => {
  const encodedABI = mySmartContract.methods[methodName](...args).encodeABI();

  const { time: gasEstimateTime, output: gas } = await mp(async () =>
    mySmartContract.methods[methodName](...args).estimateGas({
      from: senderAddr,
    }),
  );

  console.error('estimated: ', gas);

  const { time: nonceTime, output: currentNonce } = await mp(async () =>
    web3.eth.getTransactionCount(senderAddr, 'pending'),
  );

  const { time: signTime, output: signed } = await mp(async () =>
    web3.eth.accounts.signTransaction(
      {
        from: senderAddr,
        to: contractAddr,
        data: encodedABI,
        gasPrice: PRIORITY_FEE_PER_GAS.toString(),
        gas,
        nonce: currentNonce,
      },
      senderPriv,
    ),
  );

  const { time: sendTime, output: receipt } = await mp(async () =>
    web3.eth.sendSignedTransaction(signed.rawTransaction),
  );

  return {
    receipt,
    txTiming: {
      gasEstimateTime,
      nonceTime,
      signTime,
      sendTime,
    },
  };
  // }, 10);
}

async function requestEth(
  clientAddr: string,
  publicKey: string,
  ticket: Buffer,
  iat: number,
  candidateCount: number,
  contractAddr: string,
) {
  console.error(`Client addr: ${clientAddr}`);

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
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!result.ok) {
    throw new Error('Unexpected error while granting');
  }
}

async function waitForBalance(addr: string, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const balance = await web3.eth.getBalance(addr);
    if (balance > BigInt(0)) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timeout waiting for balance on ${addr}`);
}

async function emitBallot(
  publicKey: string,
  candidateCount: number,
  contractAddr: string,
  clientAddr: string,
  clientPriv: string,
  ticket: Buffer,
  iat: number,
) {
  await waitForBalance(clientAddr);

  const selected = Math.floor(Math.random() * candidateCount);

  const { time: encryptTime, output: ballot } = mpSync(() =>
    encryptVote(Buffer.from(publicKey, 'base64'), selected, candidateCount),
  );

  try {
    const { receipt, txTiming } = await callContract(
      clientAddr,
      clientPriv,
      contractAddr,
      'vote',
      ballot,
      iat,
      ticket,
    );

    return {
      blockNumber: receipt.blockNumber,
      blockHash: receipt.blockHash,
      gas: receipt.gasUsed,
      timing: { encryptTime, ...txTiming },
    };
  } catch (e) {
    console.error((e as any).message);
    console.error((e as any).cause || (e as any).innerError || '');

    throw e;
  }
}

/** Process a single ticket: grant ETH + cast vote. */
async function processTicket(
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

  console.error('DONE REQUESTING');

  const { output: castingOutput, time: castingTime } = await mp(() =>
    emitBallot(
      publicKey,
      candidateCount,
      contractAddr,
      addr,
      privateKey,
      signature,
      iat,
    ),
  );
  console.error('DONE CASTING');

  return {
    // grantTime,
    castingTime,
    gas: castingOutput.gas?.toString(),
    blockNumber: castingOutput.blockNumber?.toString(),
    timing: castingOutput.timing,
  };
}

// Usage: blockchain-interactions.ts <publicKey> <contractAddr> <candidateCount> <ticketsFile>
// ticketsFile is a path to a JSON file containing an array of ticket objects.
async function main() {
  const argv = process.argv;
  if (argv.length < 6) {
    console.error(
      'blockchain-interactions.ts <publicKey> <contractAddr> <candidateCount> <ticketsFile>',
    );
    return;
  }

  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

  const publicKey = argv[2];
  const contractAddr = argv[3];
  const candidateCount = Number(argv[4]);
  const ticketsFile = argv[5];

  const tickets: any[] = JSON.parse(readFileSync(ticketsFile, 'utf-8'));

  console.error(
    `Processing ${tickets.length} tickets concurrently in this worker...`,
  );

  // Launch all ticket processing concurrently via Promise.allSettled
  const settled = await Promise.allSettled(
    tickets.map((t) =>
      processTicket(publicKey, contractAddr, candidateCount, t),
    ),
  );

  // Normalize output: fulfilled results keep their value, rejected get an error marker
  const results = settled.map((r, i) => {
    if (r.status === 'fulfilled') {
      return { status: 'fulfilled', ...r.value };
    }
    const err = r.reason;
    console.error(`\n=== TICKET ${i} FAILED ===`);
    console.error('Message:', err?.message ?? String(err));
    if (err?.stack) console.error('Stack:', err.stack);
    if (err?.cause) console.error('Cause:', err.cause);
    if (err?.innerError) console.error('InnerError:', err.innerError);
    if (err?.data) console.error('Data:', JSON.stringify(err.data));
    return { status: 'rejected', reason: err?.message ?? String(err) };
  });

  // Output the full array as a single JSON line to stdout
  console.log(JSON.stringify(results));
}

main().then();

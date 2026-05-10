import { Web3 } from 'web3';
import { createRequest, unblind } from '@/lib/pkg/server_utilities';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const config = JSON.parse(
  readFileSync(resolve(__dirname, 'benchmark.config.json'), 'utf-8'),
);
const CONCURRENCY: number = config.webConcurrency ?? config.concurrency ?? 1000;
const ETH_NODE = process.argv[4] || config.rpcEndpoints[0];
const WEB_ADDR = config.webAddr;

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

function createAccount() {
  const web3 = new Web3(ETH_NODE);
  const account = web3.eth.accounts.create();

  return {
    addr: account.address,
    sk: account.privateKey,
  };
}

/** Generate a single credential and return the full result object. */
async function generateOne(
  electionId: number,
  index: number,
  publicKey: Buffer,
) {
  let currentPhase = 'accountCreation';
  try {
    const iat = Math.floor(Date.now() / 1000) - 10000;

    const { time: accountCreationTime, output: account } = mpSync(() =>
      createAccount(),
    );
    const { addr: clientAddr, sk: clientPriv } = account;

    currentPhase = 'createRequest';
    const { time: totalTicketTime, output: ticketResult } = await mp(
      async () => {
        const { time: createRequestTime, output: requestData } = mpSync(() =>
          createRequest(
            publicKey,
            clientAddr.toLowerCase(),
            iat,
            `election_${electionId}`,
          ),
        );

        const { blindMsg, secret } = requestData;

        currentPhase = 'signRequest';
        const { time: signRequestTime, output: signedTicket } = await mp(
          async () => {
            const ticketRes = await fetch(`${WEB_ADDR}/api/testing/sign`, {
              method: 'POST',
              body: JSON.stringify({ blindedTicket: blindMsg, electionId }),
              headers: { 'Content-Type': 'application/json' },
            });
            if (!ticketRes.ok)
              throw Object.assign(new Error(`HTTP ${ticketRes.status}`), {
                httpStatus: ticketRes.status,
              });
            const { signedTicket } = await ticketRes.json();
            return Buffer.from(signedTicket, 'base64');
          },
        );

        currentPhase = 'unblind';
        const { time: unblindTime, output: ticket } = mpSync(() =>
          unblind(
            publicKey,
            secret,
            signedTicket,
            clientAddr.toLowerCase(),
            iat,
            `election_${electionId}`,
          ),
        );

        return {
          ticket,
          timing: {
            createRequestTime,
            signRequestTime,
            unblindTime,
          },
        };
      },
    );

    return {
      status: 'fulfilled' as const,
      ticket: { addr: clientAddr, electionId, iat },
      privateKey: clientPriv,
      signature: ticketResult.ticket.toString('base64'),
      timing: {
        accountCreationMs: accountCreationTime,
        totalTicketMs: totalTicketTime,
        ...ticketResult.timing,
      },
    };
  } catch (e: any) {
    return {
      status: 'error' as const,
      voterIndex: index,
      failedPhase: currentPhase,
      error: e?.message ?? String(e),
      httpStatus: e?.httpStatus ?? null,
    };
  }
}

// Usage: generate-credentials.ts <electionId> <batchSize>
async function main() {
  const argv = process.argv;
  if (argv.length < 4) {
    console.error('generate-credentials.ts <electionId> <batchSize>');
    return;
  }

  const electionId = Number(argv[2]);
  const batchSize = Number(argv[3]);

  // Fetch public key once for the entire batch
  const publicKeyReq = await fetch(`${WEB_ADDR}/api/public-key/${electionId}`);
  if (!publicKeyReq.ok)
    throw new Error(`Failed to fetch public key: HTTP ${publicKeyReq.status}`);
  const { publicKey: pubKeyB64 } = await publicKeyReq.json();
  const publicKey = Buffer.from(pubKeyB64, 'base64');

  const results: any[] = new Array(batchSize);
  let idx = 0;

  async function runNext(): Promise<void> {
    while (idx < batchSize) {
      const i = idx++;
      results[i] = await generateOne(electionId, i, publicKey);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, batchSize) }, () => runNext()),
  );

  // Normalize: fulfilled results unwrap value, rejected get error marker
  const output = results;

  console.log(JSON.stringify(output));
}

main().then();

import { Web3 } from 'web3';
import { createRequest, unblind } from '@/lib/pkg/server_utilities';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const config = JSON.parse(
  readFileSync(resolve(__dirname, 'benchmark.config.json'), 'utf-8'),
);
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
async function generateOne(electionId: number, index: number) {
  let currentPhase = 'accountCreation';
  try {
    const iat = Math.floor(Date.now() / 1000) - 10000;

    const { time: accountCreationTime, output: account } = mpSync(() =>
      createAccount(),
    );
    const { addr: clientAddr, sk: clientPriv } = account;

    currentPhase = 'fetchPubKey';
    const { time: totalTicketTime, output: ticketResult } = await mp(
      async () => {
        const { time: fetchPubKeyTime, output: publicKey } = await mp(
          async () => {
            const publicKeyReq = await fetch(
              `${WEB_ADDR}/api/public-key/${electionId}`,
            );
            if (!publicKeyReq.ok)
              throw Object.assign(
                new Error(`HTTP ${publicKeyReq.status}`),
                { httpStatus: publicKeyReq.status },
              );
            const response = await publicKeyReq.json();
            return Buffer.from(response.publicKey, 'base64');
          },
        );

        currentPhase = 'createRequest';
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
              throw Object.assign(
                new Error(`HTTP ${ticketRes.status}`),
                { httpStatus: ticketRes.status },
              );
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
            fetchPubKeyTime,
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

  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

  const electionId = Number(argv[2]);
  const batchSize = Number(argv[3]);

  const results = await Promise.allSettled(
    Array.from({ length: batchSize }, (_, i) => generateOne(electionId, i)),
  );

  // Normalize: fulfilled results unwrap value, rejected get error marker
  const output = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    return {
      status: 'error' as const,
      voterIndex: i,
      failedPhase: 'unknown',
      error: r.reason?.message ?? String(r.reason),
      httpStatus: null,
    };
  });

  console.log(JSON.stringify(output));
}

main().then();

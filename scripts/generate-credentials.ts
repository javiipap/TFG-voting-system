import { Web3 } from 'web3';
import { createRequest, unblind } from '@/lib/pkg/server_utilities';

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

function createAccount() {
  const web3 = new Web3(ETH_NODE);
  const account = web3.eth.accounts.create();

  return {
    addr: account.address,
    sk: account.privateKey,
  };
}

async function requestTicket(
  clientAddr: string,
  electionId: number,
  iatDelay: number,
) {
  const { time: fetchPubKeyTime, output: publicKey } = await mp(async () => {
    const publicKeyReq = await fetch(
      `${WEB_ADDR}/api/public-key/${electionId}`,
    );
    const response = await publicKeyReq.json();
    return Buffer.from(response.publicKey, 'base64');
  });

  const { time: createRequestTime, output: requestData } = mpSync(() =>
    createRequest(
      publicKey,
      clientAddr.toLowerCase(),
      iatDelay,
      `election_${electionId}`,
    ),
  );

  const { blindMsg, secret } = requestData;

  const { time: signRequestTime, output: signedTicket } = await mp(async () => {
    const ticketRes = await fetch(`${WEB_ADDR}/api/testing/sign`, {
      method: 'POST',
      body: JSON.stringify({ blindedTicket: blindMsg, electionId }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!ticketRes.ok) {
      throw new Error('Unexpected error signing ticket');
    }

    const { signedTicket } = await ticketRes.json();
    return Buffer.from(signedTicket, 'base64');
  });

  const { time: unblindTime, output: ticket } = mpSync(() =>
    unblind(
      publicKey,
      secret,
      signedTicket,
      clientAddr.toLowerCase(),
      iatDelay,
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
}

/** Generate a single credential and return the full result object. */
async function generateOne(electionId: number) {
  const iat = Math.floor(Date.now() / 1000) - 10000;

  const { time: accountCreationTime, output: account } = mpSync(() =>
    createAccount(),
  );
  const { addr: clientAddr, sk: clientPriv } = account;

  const { time: totalTicketTime, output: ticketResult } = await mp(() =>
    requestTicket(clientAddr, electionId, iat),
  );

  return {
    ticket: { addr: clientAddr, electionId, iat },
    privateKey: clientPriv,
    signature: ticketResult.ticket.toString('base64'),
    timing: {
      accountCreationMs: accountCreationTime,
      totalTicketMs: totalTicketTime,
      ...ticketResult.timing,
    },
  };
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

  // Launch all credential generations concurrently via Promise.all
  const results = await Promise.all(
    Array.from({ length: batchSize }, () => generateOne(electionId)),
  );

  // Output the full array as a single JSON line to stdout
  console.log(JSON.stringify(results));
}

main().then();

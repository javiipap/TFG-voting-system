import { Web3 } from 'web3';
import { createRequest, unblind } from '@/lib/pkg/server_utilities';

const ETH_NODE = 'https://10.6.130.4';
const WEB_ADDR = 'https://e3vote.iaas.ull.es';

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
  iatDelay: number
) {
  const publicKeyReq = await fetch(`${WEB_ADDR}/api/public-key/${electionId}`);
  const response = await publicKeyReq.json();

  const publicKey = Buffer.from(response.publicKey, 'base64');

  const { blindMsg, secret } = createRequest(
    publicKey,
    clientAddr.toLowerCase(),
    iatDelay,
    `election_${electionId}`
  );

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

  const ticket = unblind(
    publicKey,
    secret,
    Buffer.from(signedTicket, 'base64'),
    clientAddr.toLowerCase(),
    iatDelay,
    `election_${electionId}`
  );

  return ticket;
}

async function main() {
  const argv = process.argv;
  if (argv.length < 3) {
    console.error('user-flow.ts <electionId>');
    return;
  }

  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

  const iat = Math.floor(Date.now() / 1000) - 10000;
  const electionId = Number(argv[2]);

  const { addr: clientAddr, sk: clientPriv } = createAccount();

  const ticket = await requestTicket(clientAddr, electionId, iat);

  console.log(
    JSON.stringify({
      ticket: {
        addr: clientAddr,
        electionId,
        iat,
      },
      privateKey: clientPriv,
      signature: ticket.toString('base64'),
    })
  );
}

main().then();

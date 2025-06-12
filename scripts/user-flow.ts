import { Web3 } from 'web3';
import {
  createRequest,
  encryptVote,
  unblind,
} from '@/lib/pkg/server_utilities';

import { getContractInfo } from '@/lib/ethereum/get-contract-info';
import { retry } from '@/lib/utils';

const ETH_NODE = 'http://10.6.130.4:8080';

export async function callContract(
  senderAddr: string,
  senderPriv: string,
  contractAddr: string,
  methodName: string,
  ...args: any[]
) {
  const web3 = new Web3(ETH_NODE);

  const { abi } = await getContractInfo();

  var mySmartContract = new web3.eth.Contract(abi, contractAddr);

  return await retry(async () => {
    const gasPrice = Math.ceil(Number(await web3.eth.getGasPrice()) * 1.4);

    const gas = await mySmartContract.methods[methodName](...args).estimateGas({
      from: senderAddr,
    });
    console.error(`expected gas: ${Number(gas) * gasPrice}`);

    const encodedABI = mySmartContract.methods[methodName](...args).encodeABI();

    const currentNonce = await web3.eth.getTransactionCount(
      senderAddr,
      'pending'
    );

    const signed = await web3.eth.accounts.signTransaction(
      {
        from: senderAddr,
        to: contractAddr,
        data: encodedABI,
        gasPrice,
        gas,
        nonce: currentNonce,
      },
      senderPriv
    );

    return await web3.eth.sendSignedTransaction(signed.rawTransaction);
  }, 10);
}

function createAccount() {
  const web3 = new Web3(ETH_NODE);
  const account = web3.eth.accounts.create();

  return {
    addr: account.address,
    sk: account.privateKey,
  };
}

const mp = async <T>(callback: () => Promise<T>) => {
  const init = performance.now();

  const output = await callback();

  const time = performance.now() - init;

  return {
    time,
    output,
  };
};

async function requestTicket(
  clientAddr: string,
  electionId: number,
  iatDelay: number
) {
  const publicKeyReq = await fetch(
    `http://localhost:3000/api/public-key/${electionId}`
  );
  const response = await publicKeyReq.json();

  const publicKey = Buffer.from(response.publicKey, 'base64');

  const { blindMsg, secret } = createRequest(
    publicKey,
    clientAddr.toLowerCase(),
    iatDelay,
    `election_${electionId}`
  );

  const ticketRes = await fetch('http://localhost:3000/api/testing/sign', {
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

async function requestEth(
  clientAddr: string,
  publicKey: string,
  ticket: Buffer,
  iat: number,
  candidateCount: number,
  contractAddr: string
) {
  console.error(`Client addr: ${clientAddr}`);

  const result = await fetch('http://localhost:3000/api/testing/grant', {
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

async function emitBallot(
  publicKey: string,
  candidateCount: number,
  contractAddr: string,
  clientAddr: string,
  clientPriv: string,
  ticket: Buffer,
  iat: number
) {
  const selected = Math.floor(Math.random() * candidateCount);

  console.error('Creating ballot');
  const ballot = encryptVote(
    Buffer.from(publicKey, 'base64'),
    selected,
    candidateCount
  );

  console.error('Cast vote');
  const receipient = await callContract(
    clientAddr,
    clientPriv,
    contractAddr,
    'vote',
    ballot,
    iat,
    ticket
  );

  return {
    blockNumber: receipient.blockNumber,
    blockHash: receipient.blockHash,
  };
}

async function main() {
  const argv = process.argv;
  if (argv.length < 5) {
    console.error('user-flow.ts <publicKey> <contractAddr> <electionId>');
    return;
  }

  const candidateCount = 6;
  const publicKey = argv[2];
  const contractAddr = argv[3];
  const iat = Math.floor(Date.now() / 1000) - 10000;

  const { addr: clientAddr, sk: clientPriv } = createAccount();

  const { output: ticket, time: ticketTime } = await mp(() =>
    requestTicket(clientAddr, Number(argv[4]), iat)
  );

  const { time: prevTime } = await mp(
    async () =>
      await requestEth(
        clientAddr,
        publicKey,
        ticket,
        iat,
        candidateCount,
        contractAddr
      )
  );

  const { time: castingTime } = await mp(
    async () =>
      await emitBallot(
        publicKey,
        candidateCount,
        contractAddr,
        clientAddr,
        clientPriv,
        ticket,
        iat
      )
  );

  console.log(`${ticketTime}, ${prevTime}, ${castingTime}`);
}

main().then();

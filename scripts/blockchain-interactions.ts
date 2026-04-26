import { Web3 } from 'web3';
import { encryptVote } from '@/lib/pkg/server_utilities';

import { getContractInfo } from '@/lib/ethereum/get-contract-info';
import { retry } from '@/lib/utils';
import { readFileSync } from 'fs';

const ETH_NODE = 'http://localhost:30545';
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
    const { time: gasPriceTime, output: gasPrice } = await mp(async () =>
      Math.ceil(Number(await web3.eth.getGasPrice()) * 1.4),
    );

    const { time: gasEstimateTime, output: gas } = await mp(async () =>
      mySmartContract.methods[methodName](...args).estimateGas({
        from: senderAddr,
      }),
    );
    console.error(`expected gas: ${Number(gas) * gasPrice}`);

    const encodedABI = mySmartContract.methods[methodName](...args).encodeABI();

    const { time: nonceTime, output: currentNonce } = await mp(async () =>
      web3.eth.getTransactionCount(senderAddr, 'pending'),
    );

    const { time: signTime, output: signed } = await mp(async () =>
      web3.eth.accounts.signTransaction(
        {
          from: senderAddr,
          to: contractAddr,
          data: encodedABI,
          gasPrice,
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
        gasPriceTime,
        gasEstimateTime,
        nonceTime,
        signTime,
        sendTime,
      },
    };
  }, 10);
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

async function emitBallot(
  publicKey: string,
  candidateCount: number,
  contractAddr: string,
  clientAddr: string,
  clientPriv: string,
  ticket: Buffer,
  iat: number,
) {
  const selected = Math.floor(Math.random() * candidateCount);

  const { time: encryptTime, output: ballot } = mpSync(() =>
    encryptVote(Buffer.from(publicKey, 'base64'), selected, candidateCount),
  );

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

  return {
    grantTime,
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

  // Launch all ticket processing concurrently via Promise.all
  const results = await Promise.all(
    tickets.map((t) =>
      processTicket(publicKey, contractAddr, candidateCount, t),
    ),
  );

  // Output the full array as a single JSON line to stdout
  console.log(JSON.stringify(results));
}

main().then();

import { Web3 } from 'web3';
import { encryptVote } from '@/lib/pkg/server_utilities';

import { getContractInfo } from '@/lib/ethereum/get-contract-info';
import { retry } from '@/lib/utils';

const ETH_NODE = 'https://10.6.130.4';
const WEB_ADDR = 'https://e3vote.iaas.ull.es';

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
    const gasPrice = 1000000;

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

    const receipient = await web3.eth.sendSignedTransaction(
      signed.rawTransaction
    );

    return receipient;
  }, 10);
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

async function requestEth(
  clientAddr: string,
  publicKey: string,
  ticket: Buffer,
  iat: number,
  candidateCount: number,
  contractAddr: string
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
    gas: receipient.gasUsed,
  };
}

async function main() {
  const argv = process.argv;
  if (argv.length < 6) {
    console.error(
      'user-flow.ts <publicKey> <contractAddr> <candidateCount> <ticket>'
    );
    return;
  }

  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

  const candidateCount = Number(argv[4]);
  const publicKey = argv[2];
  const contractAddr = argv[3];
  const ticket = argv[5];
  const {
    ticket: { addr, iat, electionId },
    privateKey,
    signature: encodedSignature,
  } = JSON.parse(ticket);

  const signature = Buffer.from(encodedSignature, 'base64');

  const { time: prevTime } = await mp(
    async () =>
      await requestEth(
        addr,
        publicKey,
        signature,
        iat,
        candidateCount,
        contractAddr
      )
  );
  console.error({
    publicKey,
    candidateCount,
    contractAddr,
    addr,
    privateKey,
    signature,
    iat,
  });
  const { output: castingOutput, time: castingTime } = await mp(
    async () =>
      await emitBallot(
        publicKey,
        candidateCount,
        contractAddr,
        addr,
        privateKey,
        signature,
        iat
      )
  );

  console.log(
    `${prevTime}, ${castingTime}, ${castingOutput.gas}, ${castingOutput.blockNumber}`
  );
}

main().then();

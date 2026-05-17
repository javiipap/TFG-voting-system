import { Web3 } from 'web3';
import { ec as EC } from 'elliptic';
import { getEthNode } from '@/lib/ethereum/get-eth-node';

export const PRIORITY_FEE_PER_GAS = BigInt(1_000_000_000);

export async function getEip1559Fees() {
  const web3 = new Web3(getEthNode());
  const block = await web3.eth.getBlock('latest');
  const baseFee = BigInt(block.baseFeePerGas ?? 0);
  const maxPriorityFeePerGas = PRIORITY_FEE_PER_GAS;
  const maxFeePerGas = baseFee * BigInt(4) + maxPriorityFeePerGas;

  return { maxFeePerGas, maxPriorityFeePerGas };
}

export const privateKeyToAddress = (sk: string) =>
  new Web3().eth.accounts.privateKeyToAccount(sk).address;

export const createEthAccount = () => new Web3().eth.accounts.create();

export const ethSign = async (msg: Buffer, privateKey: Buffer | Uint8Array) => {
  const ec = new EC('secp256k1');

  const keypair = ec.keyFromPrivate(privateKey);

  return Buffer.from(keypair.sign(msg).toDER()).toString('base64');
};

export const ethVerify = (
  msg: Buffer,
  signature: string,
  publicKey: Buffer | Uint8Array,
) => {
  const ec = new EC('secp256k1');
  const keypair = ec.keyFromPublic(publicKey);

  const derSignature = new Uint8Array(Buffer.from(signature, 'base64'));

  return keypair.verify(msg, derSignature);
};

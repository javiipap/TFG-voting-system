import { Web3 } from 'web3';
import { ec as EC } from 'elliptic';

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
  publicKey: Buffer | Uint8Array
) => {
  const ec = new EC('secp256k1');
  const keypair = ec.keyFromPublic(publicKey);

  const derSignature = new Uint8Array(Buffer.from(signature, 'base64'));

  return keypair.verify(msg, derSignature);
};

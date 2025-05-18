import { Web3 } from 'web3';

export const privateKeyToAddress = (sk: string) =>
  new Web3().eth.accounts.privateKeyToAccount(sk).address;

export const createEthAccount = () => new Web3().eth.accounts.create();

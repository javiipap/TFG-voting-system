import load_wasm, { rsa_encrypt } from 'client_utilities';
import { createEthAccount } from '@/lib/ethereum';
import { requestUserInteraction } from '@/lib/yotefirmo';

const encryptSecret = async (userPublicKey: Uint8Array, privateKey: string) => {
  await load_wasm();
  const bufferedSecretKey = Buffer.from(
    privateKey.slice(2),
    'hex'
  ) as unknown as Uint8Array;

  const encryptedEthSecret = rsa_encrypt(userPublicKey, bufferedSecretKey);

  return Buffer.from(encryptedEthSecret).toString('base64');
};

export const createAccount = async (userPublicKey: string) => {
  const account = createEthAccount();

  return {
    addr: account.address,
    sk: account.privateKey,
    encryptedEthPrivateKey: await encryptSecret(
      new Uint8Array(Buffer.from(userPublicKey, 'base64')),
      account.privateKey
    ),
  };
};

export async function encodeMetadata(fields: Array<any>) {
  const encoder = new TextEncoder();
  const data = new Uint8Array();
  fields.forEach((val) => encoder.encodeInto(val, data));
  return Buffer.from(await crypto.subtle.digest('SHA-256', data));
}

export async function signMetadata(fields: Array<any>) {
  const response = await requestUserInteraction(
    'sign',
    await encodeMetadata(fields)
  );

  const { result } = JSON.parse(response);

  return Buffer.from(result).toString('base64');
}

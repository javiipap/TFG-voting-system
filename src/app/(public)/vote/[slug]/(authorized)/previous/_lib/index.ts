import { publicKeyCreate } from 'secp256k1';
import load_wasm, { ecc_encrypt, rsa_encrypt } from 'client_utilities';
import { createEthAccount } from '@/lib/ethereum';
import { requestUserInteraction } from '@/lib/yotefirmo';

const encryptSecret = async (privateKey: string) => {
  await load_wasm();
  const bufferedSecretKey = Buffer.from(
    privateKey.slice(2),
    'hex'
  ) as unknown as Uint8Array;
  const publicKey = publicKeyCreate(bufferedSecretKey);

  const encryptedEthSecret = ecc_encrypt(publicKey, bufferedSecretKey);

  return Buffer.from(encryptedEthSecret).toString('base64');
};

export const createAccount = async () => {
  const account = createEthAccount();

  return {
    addr: account.address,
    sk: account.privateKey,
    encryptedEthPrivateKey: await encryptSecret(account.privateKey),
  };
};

export async function signMetadata(fields: Array<any>) {
  const encoder = new TextEncoder();
  const data = new Uint8Array();
  fields.forEach((val) => encoder.encodeInto(val, data));
  const payload = await crypto.subtle.digest('SHA-256', data);

  const response = await requestUserInteraction('sign', Buffer.from(payload));

  const { result } = JSON.parse(response);

  return Buffer.from(result).toString('base64');
}

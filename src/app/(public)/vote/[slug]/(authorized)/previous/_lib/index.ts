/**
 * Pasos para votar:
 * 1. Generar clave pública y privada dentro de la cadena.
 * 2. Guardar clave pública en bbdd.
 * 3. Pedir ether
 * 4. Seleccionar candidato
 * 5. Cifrar voto
 * 6. Ejecutar contrato
 * 7. Devolver id del bloque
 *
 */

import { publicKeyCreate } from 'secp256k1';
import load_wasm, { ecc_encrypt } from 'client_utilities';
import { createEthAccount } from '@/lib/ethereum';

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
    encryptedEthSecret: await encryptSecret(account.privateKey),
  };
};

// TODO: Subir y usar certificados
export function storeEncryptedSecretKey(sk: string) {}

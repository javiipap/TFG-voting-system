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

import { privateKeyVerify, publicKeyCreate } from 'secp256k1';
import { keccak256 } from 'ethers';

const privateToAddress = (pk: Uint8Array) => {
  const pub = publicKeyCreate(pk, false).slice(1);
  console.log(pub);
  return keccak256(Buffer.from(pub)).slice(-20).toString();
};

export const createAccount = () =>
  new Promise<{ addr: string; sk: string }>((resolve) => {
    let sk: Uint8Array;

    do {
      sk = new Uint8Array(32);
      window.crypto.getRandomValues(sk);
    } while (!privateKeyVerify(sk));

    resolve({
      addr: privateToAddress(sk).toString(),
      sk: Buffer.from(sk).toString('hex'),
    });
  });

export function storeEncryptedSecretKey(sk: string) {}

export function requestEther(sk: string) {
  return '';
}

export function encryptSelection(selection: number, total: number) {
  return '';
}

export function executeContract(ballot: string, address: string, sk: string) {}

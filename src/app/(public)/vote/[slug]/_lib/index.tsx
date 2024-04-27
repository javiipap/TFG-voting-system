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
import * as blindSignatures from 'blind_signatures';

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

// TODO: Subir y usar certificados
export function storeEncryptedSecretKey(sk: string) {}

export async function requestEther(addr: string) {
  await blindSignatures.default();
  return blindSignatures.create_request(
    `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAshdGLT4mwZ0oWquN2ytz
0cCWKofeyi994FtXu2xP0Tg3IIvkPUJRNc8jZrNhGnATQ4CJYBlcXxs+G2l3U/7v
O7G8G+Hno5HwBTt/j0GVrpkIAXilvOxENzpYrzS4XvdNjyZtNoTXsZEEhMf7fyWp
1xd9A5+7f3cM+KSKM/FuWwQimdmikFrAYp9P855We8FmBdvBAgnMbQeEXOL0EYCe
OJpoea1OfOU2q4XQLL81YqmbypNWH7eecG3yc5GlnOs0mAGO2UPlzPGGs4XkRiZL
vypVTUNkIlN05xC/G2KGnvZlXKfrtJk36YjrKL9gkVcXFOfTxwGNFwJiiokLTRJh
aQIDAQAB
-----END PUBLIC KEY-----`,
    addr
  );
}

export function encryptSelection(selection: number, total: number) {
  return '';
}

export function executeContract(ballot: string, address: string, sk: string) {}

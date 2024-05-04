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

import { Web3 } from 'web3';
import { env } from '@/env';

export const createAccount = () => {
  const web3 = new Web3(env.NEXT_PUBLIC_ETH_HOST);
  const account = web3.eth.accounts.create();

  return {
    addr: account.address,
    sk: account.privateKey,
  };
};

// TODO: Subir y usar certificados
export function storeEncryptedSecretKey(sk: string) {}

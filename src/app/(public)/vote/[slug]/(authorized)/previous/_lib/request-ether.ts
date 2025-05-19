import load_wasm, {
  unblind,
  create_request,
  rsa_encrypt,
} from 'client_utilities';
import { Ticket } from '@/tfg-types';
import { requestSignatureAction } from '@/app/(public)/vote/[slug]/(authorized)/previous/actions';

export async function requestEther(
  sk: string,
  encryptedEthSecret: string,
  addr: string,
  electionId: number,
  userPublicKey: string
) {
  await load_wasm();

  const publicKeyReq = await fetch(`/api/public-key/${electionId}`);

  if (!publicKeyReq.ok) {
    throw new Error("Couldn't fetch elections public key");
  }

  const { publicKey } = await publicKeyReq.json();
  const iatOffset = Date.now();
  const request = create_request(publicKey, addr, electionId, iatOffset);
  const { blind_msg: blindedSignature, secret } = request;

  const recoveryEthSecret = Buffer.from(
    rsa_encrypt(
      Buffer.from(userPublicKey) as unknown as Uint8Array,
      Buffer.from(sk, 'base64') as unknown as Uint8Array
    )
  ).toString('base64');

  // Pedir al servidor que lo firme
  const { data, serverError } = await requestSignatureAction({
    electionId,
    blinded: Buffer.from(request.blind_msg).toString('base64'),
    encryptedEthSecret,
    recoveryEthSecret,
  });

  if (!data) {
    throw new Error(serverError || 'Unexpected error');
  }

  const unblinded = unblind(
    publicKey,
    blindedSignature,
    secret,
    Buffer.from(data, 'base64') as unknown as Uint8Array
  );

  return Buffer.from(
    JSON.stringify({
      ticket: {
        addr,
        electionId,
        iatOffset,
      },
      signature: Buffer.from(unblinded).toString('base64'),
    } as Ticket)
  ).toString('base64');
}

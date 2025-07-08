import load_wasm, {
  unblind,
  create_request,
  rsa_encrypt,
  encoded_req,
} from 'client_utilities';
import { Ticket } from '@/tfg-types';
import { requestSignatureAction } from '@/app/(public)/vote/[slug]/(authorized)/previous/actions';
import { signMetadata } from '@/app/(public)/vote/[slug]/(authorized)/previous/_lib';
import { env } from '@/env';

export async function requestTicket(
  sk: string,
  _addr: string,
  electionId: number,
  userId: number,
  userPublicKey: string
) {
  await load_wasm();
  const addr = _addr.toLowerCase();
  const publicKeyReq = await fetch(`/api/public-key/${electionId}`);

  if (!publicKeyReq.ok) {
    throw new Error("Couldn't fetch elections public key");
  }

  const { publicKey: _publicKey } = await publicKeyReq.json();
  const publicKey = new Uint8Array(Buffer.from(_publicKey, 'base64'));
  const offset =
    (env.NEXT_PUBLIC_NODE_ENV === 'development' ? 1 : 600000) * Math.random();

  const iat = Math.floor((new Date().getTime() + offset) / 1000);

  const request = create_request(publicKey, addr, electionId.toString(), iat);
  const { blind_msg: blindedMsg, secret } = request;

  const recoveryEthPrivateKey = Buffer.from(
    rsa_encrypt(
      new Uint8Array(Buffer.from(userPublicKey, 'base64')),
      new Uint8Array(Buffer.from(sk, 'base64'))
    )
  ).toString('base64');

  const pubSignature = await signMetadata([userId, electionId]);

  // Pedir al servidor que lo firme
  const { data, serverError } = await requestSignatureAction({
    electionId,
    blinded: Buffer.from(blindedMsg).toString('base64'),
    recoveryEthPrivateKey,
    signature: pubSignature,
  });

  if (!data) {
    throw new Error(serverError || 'Unexpected error');
  }

  const ticketSignature = unblind(
    publicKey,
    addr,
    electionId.toString(),
    iat,
    secret,
    Buffer.from(data, 'base64') as unknown as Uint8Array
  );

  return {
    ticket: {
      addr,
      electionId,
      iat,
    },
    signature: Buffer.from(ticketSignature).toString('base64'),
  };
}

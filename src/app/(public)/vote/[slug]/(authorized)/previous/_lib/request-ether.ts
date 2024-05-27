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

  const request = create_request(publicKey, addr);

  const recoveryEthSecret = Buffer.from(
    rsa_encrypt(userPublicKey, sk)
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
    addr,
    request.secret,
    request.msg_randomizer,
    Buffer.from(data, 'base64')
  );

  return Buffer.from(
    JSON.stringify({
      ticket: {
        addr,
        electionId,
      },
      signature: Buffer.from(unblinded).toString('base64'),
      padding: Buffer.from(request.msg_randomizer).toString('base64'),
    } as Ticket)
  ).toString('base64');
}

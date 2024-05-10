import load_wasm, { unblind, create_request } from 'client_utilities';
import { Ticket } from '@/tfg-types';

export async function requestEther(addr: string, electionId: number) {
  await load_wasm();

  const publicKeyReq = await fetch(`/api/public-key/${electionId}`);

  if (!publicKeyReq.ok) {
    // TODO
    return 'a';
  }

  const { publicKey } = await publicKeyReq.json();

  const request = create_request(publicKey, addr);

  // Pedir al servidor que lo firme
  const req = await fetch('/api/sign-ticket', {
    credentials: 'include',
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      electionId,
      blinded: Buffer.from(request.blind_msg).toString('base64'),
    }),
  });

  if (!req.ok) {
    return 'b';
    // TODO
  }

  const { blindedSignature } = await req.json();
  console.log(blindedSignature);

  const unblinded = unblind(
    publicKey,
    addr,
    request.secret,
    request.msg_randomizer,
    Buffer.from(blindedSignature, 'base64')
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

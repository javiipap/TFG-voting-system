import { generateChallenge } from '@/lib/utils';
import { requestUserInteraction } from '@/lib/yotefirmo';
import load_wasm, { rsa_verify } from 'client_utilities';

export const execChallenge = async () => {
  await load_wasm();

  const challenge = generateChallenge();
  const data = await requestUserInteraction('sign', challenge);
  const { public_key: publicKey, certificate, subj, result } = JSON.parse(data);

  try {
    rsa_verify(
      new Uint8Array(publicKey),
      new Uint8Array(result),
      new Uint8Array(challenge)
    );
  } catch (e) {
    throw new Error("Couldn't verify signature");
  }

  return { publicKey, certificate, subj };
};

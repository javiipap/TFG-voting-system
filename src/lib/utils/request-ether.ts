import { env } from '@/env';

export async function requestEther(clientAddr: string, electionId: number) {
  const res = await fetch(`${env.NEXT_PUBLIC_DOMAIN}/api/faucet`, {
    method: 'POST',
    body: JSON.stringify({ clientAddr, electionId }),
    headers: {
      'Content-Type': 'Application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Error while funding account');
  }
}

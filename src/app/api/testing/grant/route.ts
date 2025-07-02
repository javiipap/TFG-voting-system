import { calculateGas } from '@/lib/ethereum/calculate-gas';
import { calculateGas2 } from '@/lib/ethereum/calculate-gas_2';
import { sendWei } from '@/lib/ethereum/send-wei';

export async function POST(request: Request) {
  const body = await request.json();

  const { clientAddr, contractAddr, publicKey, candidateCount, ticket, iat } =
    body;

  console.time(`GRANT-${clientAddr}`);

  const wei = await calculateGas2(candidateCount);

  await sendWei(clientAddr, wei);
  console.timeEnd(`GRANT-${clientAddr}`);

  return Response.json({ status: 'Account granted' });
}

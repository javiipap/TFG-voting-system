import { calculateGas } from '@/lib/ethereum/calculate-gas';
import { sendWei } from '@/lib/ethereum/send-wei';

export async function POST(request: Request) {
  const body = await request.json();

  const { clientAddr, contractAddr, publicKey, candidateCount, ticket, iat } =
    body;

  const t0 = Date.now();

  const wei = await calculateGas(
    Buffer.from(publicKey, 'base64'),
    Buffer.from(ticket, 'base64'),
    iat,
    candidateCount,
    contractAddr,
    clientAddr,
  );

  await sendWei(clientAddr, BigInt(Math.round(Number(wei) * 1.4)));

  console.log(`[grant] ${clientAddr} funded ${wei} wei in ${Date.now() - t0}ms`);

  return Response.json({ status: 'Account granted' });
}

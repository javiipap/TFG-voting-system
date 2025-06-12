import { calculateGas } from '@/lib/ethereum/calculate-gas';
import { sendWei } from '@/lib/ethereum/send-wei';

export async function POST(request: Request) {
  const body = await request.json();

  const { clientAddr, contractAddr, publicKey, candidateCount, ticket, iat } =
    body;

  console.time(`GRANT-${clientAddr}`);

  const wei = await calculateGas(
    Buffer.from(publicKey, 'base64'),
    Buffer.from(ticket, 'base64'),
    iat,
    candidateCount,
    contractAddr,
    clientAddr
  );

  await sendWei(clientAddr, wei);
  console.timeEnd(`GRANT-${clientAddr}`);

  return Response.json({ status: 'Account granted' });
}

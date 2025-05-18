import { calculateGas } from '@/lib/ethereum/calculate-gas';
import { sendWei } from '@/lib/ethereum/send-wei';

export async function POST(request: Request) {
  const body = await request.json();

  const {
    clientAddr,
    contractAddr,
    publicKey,
    candidateCount,
    ticket,
    iatOffset,
  } = body;

  console.time('GRANT');

  const wei = await calculateGas(
    Buffer.from(publicKey, 'base64'),
    Buffer.from(ticket, 'base64'),
    iatOffset,
    candidateCount,
    contractAddr,
    clientAddr
  );

  await sendWei(clientAddr, wei);
  console.timeEnd('GRANT');

  return Response.json({ status: 'Account granted' });
}

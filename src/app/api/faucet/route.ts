import { getCandidates } from '@/data-access/candidates';
import { calculateGas2 } from '@/lib/ethereum/calculate-gas_2';
import { sendWei } from '@/lib/ethereum/send-wei';

export async function POST(request: Request) {
  const body = await request.json();

  const { clientAddr, electionId } = body;

  const candidates = await getCandidates(electionId);

  const wei = await calculateGas2(candidates.length);

  await sendWei(clientAddr, wei);

  return Response.json({ status: `ETH sent to account ${wei}` });
}

import { getCandidates } from '@/data-access/candidates';
import { getElection } from '@/data-access/elections';
import { calculateGas } from '@/lib/ethereum/calculate-gas';
import { sendWei } from '@/lib/ethereum/send-wei';

export async function POST(request: Request) {
  const body = await request.json();

  const { clientAddr, electionId } = body;

  const candidates = await getCandidates(electionId);
  const election = await getElection(electionId);

  if (!election) {
    return Response.json({ status: 'Election not found' });
  }

  const wei = await calculateGas(election.masterPublicKey, candidates.length);

  await sendWei(clientAddr, wei);

  return Response.json({ status: `ETH sent to account ${wei}` });
}

import { getElection } from '@/data-access/elections';
import { sign } from 'server_utilities';

export async function POST(request: Request) {
  const body = await request.json();
  const { blindedTicket, electionId } = body;

  const election = await getElection(electionId);

  if (!election) {
    throw new Error('Election not found');
  }

  const signedTicket = sign(
    Buffer.from(election.privateKey, 'base64'),
    Buffer.from(blindedTicket, 'base64'),
  );

  console.log(`[sign] electionId=${electionId}`);

  return Response.json({ signedTicket: signedTicket.toString('base64') });
}

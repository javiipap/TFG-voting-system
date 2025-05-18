import { getElection } from '@/data-access/elections';
import { sign } from '@/lib/pkg/server_utilities';

export async function POST(request: Request) {
  const body = await request.json();
  const { blindedTicket, electionId } = body;

  const election = await getElection(electionId);

  if (!election) {
    throw new Error('Election not found');
  }
  console.time('SIGN');
  const signedTicket = sign(
    Buffer.from(election.secretKey, 'base64'),
    Buffer.from(blindedTicket, 'base64')
  );
  console.timeEnd('SIGN');

  return Response.json({ signedTicket: signedTicket.toString('base64') });
}

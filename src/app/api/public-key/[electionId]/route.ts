import { getElection } from '@/data-access/elections';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { electionId: string } }
) {
  const election = await getElection(parseInt(params.electionId));

  if (!election) {
    return new Response('', { status: 404 });
  }

  return new Response(JSON.stringify({ publicKey: election.publicKey }));
}

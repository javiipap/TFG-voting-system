import { execQuery } from '@/db/helpers';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { electionId: string } }
) {
  const election = await execQuery((db) =>
    db.query.elections.findFirst({
      where: eq(schema.elections.id, parseInt(params.electionId)),
    })
  );

  if (!election) {
    return new Response('', { status: 404 });
  }

  return new Response(JSON.stringify({ publicKey: election.publicKey }));
}

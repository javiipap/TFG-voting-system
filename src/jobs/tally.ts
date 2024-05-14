import { execQuery } from '@/db/helpers';
import { env } from '@/env';
import { callContract } from '@/lib/call-contract';
import { eq } from 'drizzle-orm';
import * as schema from '@/db/schema';

export function createReference({ electionId }: { electionId: number }) {
  return `tally_${electionId}`;
}

export async function handler({ electionId }: { electionId: number }) {
  const election = await execQuery((db) =>
    db.query.elections.findFirst({ where: eq(schema.elections.id, electionId) })
  );

  if (!election) {
    throw new Error(`Election ${electionId} doesn't exist`);
  }

  if (!election.contractAddr) {
    throw new Error(`Election ${electionId} hasn't been deployed`);
  }

  await callContract(
    env.ETH_ACCOUNT,
    env.ETH_PRIV,
    election.contractAddr,
    'tally'
  );
}

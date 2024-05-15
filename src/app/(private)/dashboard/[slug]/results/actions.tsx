'use server';

import { getElectionBySlug } from '@/data-access/elections';
import { createReference } from '@/jobs/tally';
import { forceExecution } from '@/lib/scheduler';

export async function forceTally(slug: string) {
  const election = await getElectionBySlug(slug);
  if (!election) return;

  const reference = createReference({ electionId: election.id });

  await forceExecution(reference);
}

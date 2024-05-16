'use server';

import { schema } from '@/app/(private)/dashboard/[slug]/results/_components/force-tally/validation';
import { createReference } from '@/jobs/tally';
import { authenticatedAction } from '@/lib/safe-action';
import { forceExecution } from '@/lib/scheduler';
import { revalidatePath } from 'next/cache';

export const forceTallyAction = authenticatedAction(
  schema,
  async ({ electionId, slug }) => {
    const reference = createReference({ electionId });

    // Si ya ha terminado no hacer na

    await forceExecution(reference);
    revalidatePath(`/dashboard/${slug}`, 'layout');
  }
);

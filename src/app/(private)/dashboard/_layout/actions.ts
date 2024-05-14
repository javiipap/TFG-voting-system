'use server';

import { revalidatePath } from 'next/cache';
import { createSlug } from '@/lib/utils';
import { generateRsaKeypair } from 'server_utilities';
import { authenticatedAction } from '@/lib/safe-action';
import { schema } from '@/app/(private)/dashboard/_layout/validation';
import { createElection } from '@/data-access/election';
import { schedule } from '@/lib/scheduler';

export const submitElectionAction = authenticatedAction(
  schema,
  async (
    { name, description, isPrivate, from, to, start, end, masterPublicKey },
    { user }
  ) => {
    const startDate = new Date(from);
    const endDate = new Date(to);
    startDate.setHours(parseInt(start), 0, 0, 0);
    endDate.setHours(parseInt(end), 0, 0, 0);

    const keypair = generateRsaKeypair();

    const election = await createElection({
      name,
      slug: createSlug(name),
      description,
      startDate,
      endDate,
      adminId: user.adminId,
      isPrivate,
      secretKey: keypair.secret,
      publicKey: keypair.public,
      masterPublicKey,
    });

    // schedule contract creation
    await schedule('deploy_contract', { electionId: election.id }, startDate);
    // schedule election tally
    await schedule('tally', { electionId: election.id }, endDate);

    revalidatePath('/dashboard');
    return { name, slug: election.slug };
  }
);

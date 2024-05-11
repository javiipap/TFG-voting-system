'use server';

import { revalidatePath } from 'next/cache';
import { createSlug } from '@/lib/utils';
import { generateRsaKeypair } from 'server_utilities';
import { authenticatedAction } from '@/lib/safe-action';
import { schema } from '@/app/(private)/dashboard/_layout/validation';
import { createElection } from '@/data-access/election';

export const submitElectionAction = authenticatedAction(
  schema,
  async (
    { name, description, isPrivate, from, to, start, end, masterPublicKey },
    { user }
  ) => {
    const startDate = new Date(from);
    const endDate = new Date(to);
    startDate.setHours(parseInt(start));
    endDate.setHours(parseInt(end));

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

    revalidatePath('/dashboard');
    return { name, slug: election.slug };
  }
);

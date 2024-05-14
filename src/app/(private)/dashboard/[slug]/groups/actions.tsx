'use server';

import { linkGroupToElection } from '@/db/helpers';
import { revalidatePath } from 'next/cache';

export async function authorizeGroup(formData: FormData) {
  const electionSlug = formData.get('electionSlug') as string;
  const electionId = parseInt(formData.get('electionId') as string);
  const groupId = parseInt(formData.get('group') as string);

  await linkGroupToElection(electionId, groupId);

  revalidatePath(`/dashboard/${electionSlug}/groups`);
}

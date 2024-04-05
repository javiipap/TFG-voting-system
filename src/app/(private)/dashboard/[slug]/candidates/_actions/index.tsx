'use server';

import { addCandidate, getElection } from '@/db/helpers';
import { revalidatePath } from 'next/cache';

export const submitCandidate = async (formData: FormData) => {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const slug = formData.get('slug') as string;
  // const img = formData.get('img');

  const election = await getElection(slug);

  await addCandidate({
    electionId: election!.id,
    name,
    description,
    // img,
  });

  revalidatePath(`/dashboard/${slug}/candidates`, 'page');
};

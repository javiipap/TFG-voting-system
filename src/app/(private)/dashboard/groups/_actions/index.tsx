'use server';

import { deleteGroup } from '@/db/helpers';
import { revalidatePath } from 'next/cache';

export const submitDeleteGroup = async (id: number) => {
  await deleteGroup(id);
  revalidatePath('/dashboard/groups');
};

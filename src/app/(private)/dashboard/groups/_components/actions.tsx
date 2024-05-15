'use server';

import { schema } from '@/app/(private)/dashboard/groups/_components/validation';
import { deleteGroup } from '@/db/helpers';
import { authenticatedAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';

export const deleteGroupAction = authenticatedAction(schema, async ({ id }) => {
  await deleteGroup(id);
  revalidatePath('/dashboard/groups');
});

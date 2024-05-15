'use server';

import { redirect } from 'next/navigation';
import { authenticatedAction } from '@/lib/safe-action';
import { schema } from '@/app/(private)/dashboard/groups/create/_components/group-form/validation';
import { addUsersToGroup, createGroup } from '@/data-access/groups';
import { insertIfNotExist } from '@/data-access/user';

export const createGroupAction = authenticatedAction(
  schema,
  async ({ name, description, members }, { user }) => {
    const groupId = await createGroup(name, description, user.adminId);
    const userIds = await insertIfNotExist(members);

    await addUsersToGroup(userIds, groupId);

    redirect('/dashboard/groups');
  }
);

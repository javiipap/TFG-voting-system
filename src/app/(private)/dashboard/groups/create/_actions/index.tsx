'use server';

import { auth } from '@/auth';
import { getConnection } from '@/db/helpers';
import * as schema from '@/db/schema';
import { createSlug } from '@/lib/utils';
import { redirect } from 'next/navigation';

export async function submitGroup(formData: FormData) {
  const session = await auth();

  if (!session) {
    return;
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const rawMembers = formData.get('members') as string;
  const members = JSON.parse(rawMembers);

  const { db, client } = getConnection();

  const groupId = await db
    .insert(schema.userGroups)
    .values({
      name,
      slug: createSlug(name),
      description,
      adminId: session?.user.adminId!,
    })
    .returning({ id: schema.userGroups.id });

  const userIds = await db
    .insert(schema.users)
    .values(members)
    .onConflictDoUpdate({
      target: [schema.users.email],
      set: {
        emailVerified: new Date(),
      },
    })
    .returning({ id: schema.users.id });

  await db.insert(schema.userGroupMemberships).values(
    userIds.map(({ id }) => ({
      userId: id,
      groupId: groupId[0].id,
    }))
  );

  await client.end();

  redirect('/dashboard/groups');
}

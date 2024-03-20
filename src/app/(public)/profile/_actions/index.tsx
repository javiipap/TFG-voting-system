'use server';

import { getConnection } from '@/db/helpers';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';

export async function promoteAdmin(formData: FormData) {
  const session = await auth();

  if (!session) {
    // Jamás debería entrar aquí
    return;
  }

  const { client, db } = getConnection();

  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, session.user.email ?? ''),
  });

  if (!user) {
    // Jamás debería entrar aquí
    return;
  }

  await db
    .insert(schema.admins)
    .values({
      userId: user.id,
    })
    .onConflictDoNothing();

  await client.end();
}

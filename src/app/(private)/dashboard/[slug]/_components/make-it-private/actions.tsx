'use server';

import { getConnection } from '@/db/helpers';
import { revalidatePath } from 'next/cache';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function makeItPrivateAction(slug: string) {
  const { db, client } = getConnection();
  await db
    .update(schema.elections)
    .set({
      isPrivate: true,
    })
    .where(eq(schema.elections.slug, slug));
  client.end();
  revalidatePath(`/dashboard/${slug}`, 'layout');
}

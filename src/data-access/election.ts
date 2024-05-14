import { execQuery } from '@/db/helpers';
import * as schema from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export const createElection = async (
  election: typeof schema.elections.$inferInsert
) => {
  return execQuery(async (db) => {
    const result = await db
      .insert(schema.elections)
      .values(election)
      .returning({ slug: schema.elections.slug, id: schema.elections.id });

    return result[0];
  });
};

export const canEditElection = async (adminId: number, electionId: number) => {
  const result = await execQuery((db) =>
    db.query.elections.findFirst({
      where: and(
        eq(schema.elections.id, electionId),
        eq(schema.elections.adminId, adminId)
      ),
    })
  );

  return !!result;
};

export const getElection = async (slug: string) =>
  execQuery((db) =>
    db.query.elections.findFirst({ where: eq(schema.elections.slug, slug) })
  );

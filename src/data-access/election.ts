import { execQuery } from '@/db/helpers';
import * as schema from '@/db/schema';

export const createElection = async (
  election: typeof schema.elections.$inferInsert
) => {
  return execQuery(async (db) => {
    const result = await db
      .insert(schema.elections)
      .values(election)
      .returning({ slug: schema.elections.slug });

    return result[0];
  });
};

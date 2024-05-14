import { execQuery } from '@/db/helpers';
import * as schema from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export const getAvailableGroups = (adminId: number, slug: string) =>
  execQuery(async (db) => {
    const election = await db.query.elections.findFirst({
      where: eq(schema.elections.slug, slug),
    });

    if (!election) {
      throw new Error('Election not found');
    }

    return db
      .select()
      .from(schema.userGroups)
      .where(eq(schema.userGroups.adminId, adminId))
      .leftJoin(
        schema.authorizedGroups,
        and(
          eq(schema.authorizedGroups.groupId, schema.userGroups.id),
          eq(schema.authorizedGroups.electionId, election.id)
        )
      );
  });

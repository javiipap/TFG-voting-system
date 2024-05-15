import { execQuery, getConnection } from '@/db/helpers';
import * as schema from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { createSlug as createSlug_ } from '@/lib/utils';

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

const createSlug = async (name: string) => {
  let slug = createSlug_(name);
  let i = 0;

  const { db, client } = getConnection();

  try {
    while (true) {
      const existingGroup = await db
        .select()
        .from(schema.userGroups)
        .where(eq(schema.userGroups.slug, slug));

      if (!existingGroup.length) {
        break;
      }

      slug = `${slug.split('-')[0]}-${i}`;
    }
    client.end();
  } catch (e) {
    client.end();
    throw e;
  }

  return slug;
};

export const createGroup = (
  name: string,
  description: string,
  adminId: number
) =>
  execQuery(async (db) => {
    const group = await db
      .insert(schema.userGroups)
      .values({
        name,
        slug: await createSlug(name),
        description,
        adminId: adminId,
      })
      .returning({ id: schema.userGroups.id });

    if (group.length < 1) {
      throw new Error('Unknown database error');
    }

    return group[0].id;
  });

export const addUsersToGroup = async (
  users: { id: number }[],
  groupId: number
) =>
  execQuery((db) =>
    db
      .insert(schema.userGroupMemberships)
      .values(users.map(({ id: userId }) => ({ userId, groupId })))
  );

import { execQuery } from '@/db/helpers';
import { eq, and } from 'drizzle-orm';
import * as schema from '@/db/schema';

export const getElections = async (adminId: number) => {
  return await execQuery((db) =>
    db.query.elections.findMany({
      where: eq(schema.elections.adminId, adminId),
    })
  );
};

export const isAdmin = async (email: string) => {
  return (
    (
      await execQuery((db) => {
        return db
          .select()
          .from(schema.users)
          .innerJoin(
            schema.admins,
            and(
              eq(schema.users.id, schema.admins.userId),
              eq(schema.users.email, email)
            )
          );
      })
    ).length > 0
  );
};

export const getAdmin = async (email: string) => {
  return await execQuery(async (db) => {
    const result = await db
      .select()
      .from(schema.users)
      .innerJoin(
        schema.admins,
        and(
          eq(schema.users.id, schema.admins.userId),
          eq(schema.users.email, email)
        )
      );

    if (result.length < 1) {
      return null;
    }

    return {
      ...result[0].users,
      adminId: result[0].admins.id,
    };
  });
};

export const getAdminId = async (email: string) => {
  return await execQuery(async (db) => {
    const result = await db
      .select()
      .from(schema.users)
      .innerJoin(
        schema.admins,
        and(
          eq(schema.users.id, schema.admins.userId),
          eq(schema.users.email, email)
        )
      );

    if (result.length < 1) {
      return null;
    }

    return result[0].admins.id;
  });
};

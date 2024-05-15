import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

export const getConnection = () => {
  const client = postgres({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? ''),
    db: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PWD,
  });

  const db = drizzle(client, { schema });

  return { client, db };
};

export const execQuery = async <T>(
  fn: (db: PostgresJsDatabase<typeof schema>) => Promise<T>
) => {
  const { client, db } = getConnection();

  const result = await fn(db);

  await client.end();

  return result;
};

export const getElection = async (slug: string) => {
  return await execQuery((db) =>
    db.query.elections.findFirst({
      where: eq(schema.elections.slug, slug),
    })
  );
};

export const getElections = async (adminId: number) => {
  return await execQuery((db) =>
    db.query.elections.findMany({
      where: eq(schema.elections.adminId, adminId),
    })
  );
};

export const getCandidates = async (slug: string) => {
  return await execQuery((db) =>
    db
      .select()
      .from(schema.elections)
      .innerJoin(
        schema.candidates,
        eq(schema.elections.id, schema.candidates.electionId)
      )
  );
};

export const addCandidate = async (
  candidate: typeof schema.candidates.$inferInsert
) => {
  return await execQuery((db) =>
    db.insert(schema.candidates).values(candidate)
  );
};

export const deleteCandidate = async (id: number) => {
  return await execQuery((db) =>
    db.delete(schema.candidates).where(eq(schema.candidates.id, id))
  );
};

export const addUsers = async (
  members: (typeof schema.users.$inferInsert)[]
) => {
  return await execQuery((db) =>
    db.insert(schema.users).values(members).returning({ id: schema.users.id })
  );
};

export const isAdmin = async (email: string) => {
  return (
    (
      await execQuery((db) =>
        db
          .select()
          .from(schema.users)
          .innerJoin(
            schema.admins,
            and(
              eq(schema.users.id, schema.admins.userId),
              eq(schema.users.email, email)
            )
          )
      )
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

export const getPublicElections = async () => {
  return await execQuery((db) =>
    db
      .select()
      .from(schema.elections)
      .where(eq(schema.elections.isPrivate, false))
  );
};

export const storeTicket = async (
  ticket: typeof schema.issuedTickets.$inferInsert
) => {
  return await execQuery((db) =>
    db.insert(schema.issuedTickets).values(ticket)
  );
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

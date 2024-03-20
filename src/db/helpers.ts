import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';
import { and, eq } from 'drizzle-orm';

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

const execQuery = async <T>(
  fn: (db: PostgresJsDatabase<typeof schema>) => Promise<T>
) => {
  const { client, db } = getConnection();

  const result = await fn(db);

  await client.end();

  return result;
};

export const getBallot = async (slug: string) => {
  return await execQuery((db) =>
    db.query.ballots.findFirst({
      where: eq(schema.ballots.slug, slug),
    })
  );
};

export const getBallots = async (adminId: number) => {
  return await execQuery((db) =>
    db.query.ballots.findMany({ where: eq(schema.ballots.adminId, adminId) })
  );
};

export const getVoters = async (slug: string) => {
  return await execQuery((db) =>
    db
      .selectDistinctOn([schema.users.id], {
        id: schema.users.id,
        name: schema.users.name,
        hasVoted: schema.votes.id,
        groupId: schema.userGroups.id,
        groupName: schema.userGroups.name,
      })
      .from(schema.ballots)
      .where(eq(schema.ballots.slug, slug))
      .innerJoin(
        schema.authorizedGroups,
        eq(schema.ballots.id, schema.authorizedGroups.ballotId)
      )
      .innerJoin(
        schema.userGroups,
        eq(schema.authorizedGroups.groupId, schema.userGroups.id)
      )
      .innerJoin(
        schema.userGroupMemberships,
        eq(schema.userGroups.id, schema.userGroupMemberships.groupId)
      )
      .innerJoin(
        schema.users,
        eq(schema.userGroupMemberships.userId, schema.users.id)
      )
      .leftJoin(
        schema.votes,
        and(
          eq(schema.users.id, schema.votes.userId),
          eq(schema.ballots.id, schema.votes.ballotId)
        )
      )
      .groupBy(
        schema.votes.id,
        schema.users.id,
        schema.userGroups.id,
        schema.userGroups.name
      )
  );
};

export const getCandidates = async (slug: string) => {
  return await execQuery((db) =>
    db
      .select()
      .from(schema.ballots)
      .innerJoin(
        schema.candidates,
        eq(schema.ballots.id, schema.candidates.ballotId)
      )
  );
};

export const createBallot = async (
  ballot: typeof schema.ballots.$inferInsert
) => {
  return await execQuery((db) =>
    db
      .insert(schema.ballots)
      .values(ballot)
      .returning({ slug: schema.ballots.slug })
  );
};

export const createGroup = async (
  group: typeof schema.userGroups.$inferInsert
) => {
  return await execQuery((db) =>
    db
      .insert(schema.userGroups)
      .values(group)
      .returning({ id: schema.userGroups.id })
  );
};

export const addUsers = async (
  members: (typeof schema.users.$inferInsert)[]
) => {
  return await execQuery((db) =>
    db.insert(schema.users).values(members).returning({ id: schema.users.id })
  );
};

export const linkMembers = async (userIds: number[], groupId: number) => {
  return await execQuery((db) =>
    db
      .insert(schema.userGroupMemberships)
      .values(userIds.map((userId) => ({ userId, groupId })))
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
  return await execQuery((db) =>
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
  );
};

export const getGroups = async (adminId: number) => {
  return await execQuery((db) =>
    db.query.userGroups.findMany({
      where: eq(schema.userGroups.adminId, adminId),
    })
  );
};

export const linkGroupToElection = async (
  electionId: number,
  groupId: number
) => {
  return await execQuery((db) =>
    db.insert(schema.authorizedGroups).values({ ballotId: electionId, groupId })
  );
};

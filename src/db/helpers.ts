import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';
import { and, eq } from 'drizzle-orm';

const execQuery = async <T>(
  fn: (db: PostgresJsDatabase<typeof schema>) => Promise<T>
) => {
  const client = postgres('postgres://pi:password@192.168.1.10:5432/tfg');
  const db = drizzle(client, { schema });

  const result = await fn(db);

  client.end();

  return result;
};

export const getBallot = async (slug: string) => {
  return await execQuery((db) =>
    db.query.ballots.findFirst({
      where: eq(schema.ballots.slug, slug),
    })
  );
};

export const getBallots = async () => {
  return await execQuery((db) => db.query.ballots.findMany());
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

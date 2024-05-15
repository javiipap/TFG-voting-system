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

export const getElection = async (id: number) =>
  execQuery((db) =>
    db.query.elections.findFirst({ where: eq(schema.elections.id, id) })
  );

export const getElectionBySlug = async (slug: string) =>
  execQuery((db) =>
    db.query.elections.findFirst({ where: eq(schema.elections.slug, slug) })
  );

export const getVoters = async (slug: string) => {
  return execQuery(async (db) => {
    const election = await getElectionBySlug(slug);

    if (!election) {
      throw new Error('Election not found');
    }

    if (!election.isPrivate) {
      return await db
        .selectDistinctOn([schema.users.id], {
          id: schema.users.id,
          name: schema.users.name,
          hasVoted: schema.votes.id,
        })
        .from(schema.votes)
        .where(eq(schema.votes.electionId, election.id))
        .innerJoin(schema.users, eq(schema.votes.userId, schema.users.id));
    }

    return await db
      .selectDistinctOn([schema.users.id], {
        id: schema.users.id,
        name: schema.users.name,
        hasVoted: schema.votes.id,
      })
      .from(schema.authorizedUsers)
      .where(eq(schema.authorizedUsers.electionId, election.id))
      .innerJoin(
        schema.users,
        eq(schema.users.id, schema.authorizedUsers.userId)
      )
      .leftJoin(
        schema.votes,
        and(
          eq(schema.votes.userId, schema.users.id),
          eq(schema.votes.electionId, election.id)
        )
      );
  });
};

export const startElection = async (
  contractAddr: string,
  startDate: Date,
  electionId: number
) =>
  execQuery((db) =>
    db
      .update(schema.elections)
      .set({ contractAddr, startDate })
      .where(eq(schema.elections.id, electionId))
  );

export const addBallot = async ({
  userId,
  electionId,
  encryptedEthSecret,
  recoveryEthSecret,
}: schema.InsertBallot) =>
  execQuery((db) =>
    db.insert(schema.votes).values({
      userId,
      electionId,
      encryptedEthSecret,
      recoveryEthSecret,
    })
  );

export const getCandidates = async (electionId: number) =>
  execQuery((db) =>
    db.query.candidates.findMany({
      where: eq(schema.candidates.electionId, electionId),
    })
  );

export const getBallot = async (electionId: number, userId: number) =>
  execQuery((db) =>
    db.query.votes.findFirst({
      where: and(
        eq(schema.votes.electionId, electionId),
        eq(schema.votes.userId, userId)
      ),
    })
  );

export const deleteBallot = async (electionId: number, userId: number) =>
  execQuery((db) =>
    db
      .delete(schema.votes)
      .where(
        and(
          eq(schema.votes.electionId, electionId),
          eq(schema.votes.userId, userId)
        )
      )
  );

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

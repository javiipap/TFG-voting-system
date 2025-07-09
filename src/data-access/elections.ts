import { execQuery, getConnection } from '@/db/helpers';
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
          email: schema.users.email,
          hasVoted: schema.votes.id,
          signature: schema.votes.signature,
          pk: schema.users.publicKey,
          cert: schema.users.cert,
        })
        .from(schema.votes)
        .where(eq(schema.votes.electionId, election.id))
        .innerJoin(schema.users, eq(schema.votes.userId, schema.users.id));
    }

    return await db
      .selectDistinctOn([schema.users.id], {
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        hasVoted: schema.votes.id,
        signature: schema.votes.signature,
        pk: schema.users.publicKey,
        cert: schema.users.cert,
      })
      .from(schema.authorizedUsers)
      .innerJoin(
        schema.users,
        eq(schema.users.id, schema.authorizedUsers.userId)
      )
      .leftJoin(
        schema.votes,
        and(
          eq(schema.votes.userId, schema.authorizedUsers.userId),
          eq(schema.votes.electionId, schema.authorizedUsers.electionId)
        )
      )
      .where(eq(schema.authorizedUsers.electionId, election.id));
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
  recoveryEthPrivateKey,
  signature,
}: schema.InsertBallot) =>
  execQuery((db) =>
    db.insert(schema.votes).values({
      userId,
      electionId,
      recoveryEthPrivateKey,
      signature,
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

export const getPublicElections = () => {
  return execQuery((db) =>
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

export const authorizeUser = async (email: string, electionId: number) => {
  const { db, client } = getConnection();

  let userId = (
    await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    })
  )?.id;

  if (!userId) {
    userId = (
      await db
        .insert(schema.users)
        .values({ email })
        .returning({ id: schema.users.id })
    )[0].id;
  } else {
    const isAuthorized = await db.query.authorizedUsers.findFirst({
      where: and(
        eq(schema.authorizedUsers.userId, userId),
        eq(schema.authorizedUsers.electionId, electionId)
      ),
    });

    if (isAuthorized) {
      client.end();
      return;
    }
  }

  await db
    .insert(schema.authorizedUsers)
    .values({ electionId, userId: userId });

  client.end();
};

export const unAuthorizeUser = (userId: number, electionId: number) =>
  execQuery((db) =>
    db
      .delete(schema.authorizedUsers)
      .where(
        and(
          eq(schema.authorizedUsers.electionId, electionId),
          eq(schema.authorizedUsers.userId, userId)
        )
      )
  );

export const setResult = (electionId: number, result: string, endDate: Date) =>
  execQuery((db) =>
    db
      .update(schema.elections)
      .set({ encryptedResult: result, endDate })
      .where(eq(schema.elections.id, electionId))
  );

export const getPrivateElections = async (userId: number | undefined) => {
  if (typeof userId === 'undefined') {
    return [];
  }

  return await execQuery((db) =>
    db
      .selectDistinctOn([schema.elections.id], {
        slug: schema.elections.slug,
        id: schema.elections.id,
        name: schema.elections.name,
        description: schema.elections.description,
      })
      .from(schema.elections)
      .innerJoin(
        schema.authorizedUsers,
        eq(schema.elections.id, schema.authorizedUsers.electionId)
      )
      .where(eq(schema.authorizedUsers.userId, userId))
  );
};

export const getVote = (userId: number, electionId: number) =>
  execQuery((db) =>
    db.query.votes.findFirst({
      where: and(
        eq(schema.votes.userId, userId),
        eq(schema.votes.electionId, electionId)
      ),
    })
  );

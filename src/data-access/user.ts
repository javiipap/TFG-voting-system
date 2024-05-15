import { execQuery } from '@/db/helpers';
import * as schema from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export const isAuthorizedToVote = async (
  userId: number,
  electionId: number
) => {
  const result = await execQuery((db) =>
    db
      .selectDistinctOn([schema.users.id], {
        id: schema.users.id,
      })
      .from(schema.elections)
      .where(
        and(eq(schema.elections.id, electionId), eq(schema.users.id, userId))
      )
      .innerJoin(
        schema.authorizedGroups,
        eq(schema.elections.id, schema.authorizedGroups.electionId)
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
      .groupBy(schema.users.id)
  );

  return result.length > 0;
};

export const getUser = () => {};

export const insertIfNotExist = async (members: { email: string }[]) =>
  execQuery((db) =>
    db
      .insert(schema.users)
      .values(members)
      .onConflictDoUpdate({
        target: [schema.users.email],
        set: { emailVerified: new Date() },
      })
      .returning({ id: schema.users.id })
  );

export const getEncryptedAddr = async (userId: number, electionId: number) => {
  const ballot = await execQuery((db) =>
    db.query.votes.findFirst({
      where: and(
        eq(schema.votes.userId, userId),
        eq(schema.votes.electionId, electionId)
      ),
    })
  );

  return ballot?.recoveryEthSecret;
};

import { execQuery } from '@/db/helpers';
import * as schema from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export const isAuthorizedTovote = (userId: number, electionId: number) =>
  execQuery((db) =>
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

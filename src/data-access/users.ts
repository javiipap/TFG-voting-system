import { execQuery } from '@/db/helpers';
import * as schema from '@/db/schema';
import { and, eq, or } from 'drizzle-orm';

export const isAuthorizedToVote = async (userId: number, electionId: number) =>
  !!(await execQuery((db) =>
    db.query.authorizedUsers.findFirst({
      where: and(
        eq(schema.authorizedUsers.userId, userId),
        eq(schema.authorizedUsers.electionId, electionId)
      ),
    })
  ));

export const getUserByCertOrEmail = (cert: string, email: string) =>
  execQuery((db) =>
    db.query.users.findFirst({
      where: or(eq(schema.users.email, email), eq(schema.users.cert, cert)),
    })
  );

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

export const addUser = (user: schema.InsertUser) =>
  execQuery((db) => db.insert(schema.users).values(user));

export const updateUserByEmail = (user: schema.InsertUser) =>
  execQuery((db) =>
    db.update(schema.users).set(user).where(eq(schema.users.email, user.email))
  );

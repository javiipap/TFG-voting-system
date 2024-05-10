import { auth } from '@/lib/auth';
import { execQuery } from '@/db/helpers';
import * as schema from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { sign } from 'server_utilities';

export async function POST(request: Request) {
  const body = await request.json();
  const session = await auth();

  if (!session) {
    return new Response('', { status: 401 });
  }

  const user = await execQuery((db) =>
    db.query.users.findFirst({
      where: eq(schema.users.email, session.user.email!),
    })
  );

  if (!user) {
    return new Response('', { status: 400 });
  }

  const election = await execQuery((db) =>
    db.query.elections.findFirst({
      where: eq(schema.elections.id, body.electionId),
    })
  );

  if (!election) {
    return new Response('', { status: 400 });
  }

  if (election.isPrivate) {
    const isAuthorized = await execQuery((db) =>
      db
        .selectDistinctOn([schema.users.id], {
          id: schema.users.id,
        })
        .from(schema.elections)
        .where(
          and(
            eq(schema.elections.id, body.electionId),
            eq(schema.users.id, user.id)
          )
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

    if (isAuthorized.length <= 0) {
      return new Response('', { status: 403 });
    }
  }

  // Crear papeleta en la base de datos
  try {
    await execQuery((db) =>
      db
        .insert(schema.votes)
        .values({ userId: user.id, electionId: election.id })
    );
  } catch {
    // Ya tiene un voto
    return new Response('', { status: 409 });
  }

  // Firmar petición
  const blindedSignature = sign(
    election.secretKey,
    Buffer.from(body.blinded, 'base64')
  ).toString('base64');

  return new Response(JSON.stringify({ blindedSignature }));
}

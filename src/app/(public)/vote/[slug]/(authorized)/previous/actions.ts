'use server';

import { execQuery } from '@/db/helpers';
import { eq } from 'drizzle-orm';
import { sign } from 'server_utilities';
import { ActionError, authenticatedAction } from '@/lib/safe-action';
import { isAuthorizedTovote } from '@/data-access/user';
import { elections, votes } from '@/db/schema';
import { schema } from '@/app/(public)/vote/[slug]/(authorized)/previous/validation';

export const requestSignatureAction = authenticatedAction(
  schema,
  async (
    { electionId, blinded, encryptedEthSecret, recoveryEthSecret },
    { user }
  ) => {
    const election = await execQuery((db) =>
      db.query.elections.findFirst({
        where: eq(elections.id, electionId),
      })
    );

    if (!election) {
      throw new ActionError("Election doesen't exist");
    }

    if (election.isPrivate) {
      const isAuthorized = isAuthorizedTovote(user.userId, election.id);

      if (!isAuthorized) {
        throw new ActionError("User isn't authorized to vote");
      }
    }

    // Crear papeleta en la base de datos
    try {
      await execQuery((db) =>
        db.insert(votes).values({
          userId: user.userId,
          electionId: election.id,
          encryptedEthSecret,
          recoveryEthSecret,
        })
      );
    } catch {
      throw new ActionError('already-voted');
    }

    // Firmar petición
    const blindedSignature = sign(
      election.secretKey,
      Buffer.from(blinded, 'base64')
    ).toString('base64');

    return blindedSignature;
  }
);

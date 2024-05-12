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
      throw new ActionError('');
    }

    if (election.isPrivate) {
      const isAuthorized = isAuthorizedTovote(user.id, election.id);

      if (!isAuthorized) {
        throw new ActionError('');
      }
    }

    // Crear papeleta en la base de datos
    await execQuery((db) =>
      db.insert(votes).values({
        userId: user.id,
        electionId: election.id,
        encryptedEthSecret,
        recoveryEthSecret,
      })
    );

    // Firmar petición
    const blindedSignature = sign(
      election.secretKey,
      Buffer.from(blinded, 'base64')
    ).toString('base64');

    return blindedSignature;
  }
);

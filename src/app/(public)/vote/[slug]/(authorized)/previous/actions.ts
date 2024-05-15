'use server';

import { sign } from 'server_utilities';
import { ActionError, authenticatedAction } from '@/lib/safe-action';
import { isAuthorizedToVote } from '@/data-access/user';
import { schema } from '@/app/(public)/vote/[slug]/(authorized)/previous/validation';
import { addBallot, getElection } from '@/data-access/election';

export const requestSignatureAction = authenticatedAction(
  schema,
  async (
    { electionId, blinded, encryptedEthSecret, recoveryEthSecret },
    { user }
  ) => {
    const election = await getElection(electionId);

    if (!election) {
      throw new ActionError("Election doesen't exist");
    }

    if (election.isPrivate) {
      const isAuthorized = await isAuthorizedToVote(user.userId, election.id);

      if (!isAuthorized) {
        throw new ActionError("User isn't authorized to vote");
      }
    }

    // Crear papeleta en la base de datos
    try {
      await addBallot({
        userId: user.userId,
        electionId,
        encryptedEthSecret,
        recoveryEthSecret,
      });
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

import { canEditElection } from '@/data-access/election';
import { auth } from '@/lib/auth';
import { DEFAULT_SERVER_ERROR, createSafeActionClient } from 'next-safe-action';

export const unauthenticatedAction = createSafeActionClient({
  handleReturnedServerError: (e) => {
    if (e instanceof ActionError) {
      return e.message;
    }

    return DEFAULT_SERVER_ERROR;
  },
});

export const authenticatedAction = createSafeActionClient({
  middleware: async () => {
    const session = await auth();

    if (!session) {
      throw new ActionError('User not found');
    }

    return { user: session.user };
  },
  handleReturnedServerError: (e) => {
    if (e instanceof ActionError) {
      return e.message;
    }

    return DEFAULT_SERVER_ERROR;
  },
});

export const authenticatedElectionAction = createSafeActionClient({
  middleware: async ({ electionId }) => {
    const session = await auth();

    if (!session) {
      throw new ActionError('User not found');
    }

    const canEdit = await canEditElection(session.user.adminId, electionId);

    if (!canEdit) {
      throw new ActionError('User cannot edit this election');
    }

    return { user: session.user };
  },
  handleReturnedServerError: (e) => {
    if (e instanceof ActionError) {
      return e.message;
    }

    return DEFAULT_SERVER_ERROR;
  },
});

export class ActionError extends Error {}

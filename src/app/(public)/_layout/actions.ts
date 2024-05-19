'use server';

import { signOut } from '@/lib/auth';
import { unauthenticatedAction } from '@/lib/safe-action';

export const signOutAction = unauthenticatedAction({}, async () => {
  await signOut();
});

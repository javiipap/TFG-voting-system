'use server';

import { signIn } from '@/lib/auth';
import { unauthenticatedAction } from '@/lib/safe-action';
import { schema } from './validation';

export const signInAction = unauthenticatedAction(schema, async ({ cert }) => {
  await signIn('credentials', { cert, redirect: true, redirectTo: '/' });
});

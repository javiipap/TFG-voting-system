'use server';

import { signIn } from '@/lib/auth';
import { unauthenticatedAction } from '@/lib/safe-action';
import { schema } from './validation';
import { redirect } from 'next/navigation';

export const signInAction = unauthenticatedAction(schema, async ({ cert }) => {
  try {
    await signIn('credentials', { cert, redirect: false });
  } catch {
    return redirect('/register?error=no-acc');
  }

  redirect('/');
});

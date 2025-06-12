'use server';

import { unauthenticatedAction } from '@/lib/safe-action';
import { schema } from '@/app/(public)/register/_components/validation';
import { redirect } from 'next/navigation';
import crypto from 'crypto';
import {
  addUser,
  getUserByCertOrEmail,
  updateUserByEmail,
} from '@/data-access/users';

export const signUpAction = unauthenticatedAction(
  schema,
  async ({ name, email, cert, publicKey }) => {
    const existingUser = await getUserByCertOrEmail(cert, email);

    if (existingUser && existingUser.cert) {
      redirect('/login');
    }

    if (!existingUser) {
      await addUser({ name, email, cert, publicKey });
    } else {
      await updateUserByEmail({ name, cert, publicKey, email });
    }

    redirect('/login');
  }
);

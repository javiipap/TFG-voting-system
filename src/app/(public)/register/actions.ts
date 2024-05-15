'use server';

import { ActionError, unauthenticatedAction } from '@/lib/safe-action';
import { schema } from '@/app/(public)/register/validation';
import { redirect } from 'next/navigation';
import crypto from 'crypto';
import {
  addUser,
  getUserByCertOrEmail,
  updateUserByEmail,
} from '@/data-access/users';

export const signUpAction = unauthenticatedAction(
  schema,
  async ({ name, email, cert }) => {
    const existingUser = await getUserByCertOrEmail(cert, email);

    if (existingUser && existingUser.cert) {
      throw new ActionError('User already exists on database');
    }

    const publicKey = crypto
      .createPublicKey(cert)
      .export({ type: 'pkcs1', format: 'pem' })
      .toString();

    if (!existingUser) {
      await addUser({ name, email, cert, publicKey });
    } else {
      await updateUserByEmail({ name, cert, publicKey, email });
    }

    redirect('/login');
  }
);

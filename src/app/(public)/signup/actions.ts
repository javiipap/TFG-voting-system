'use server';

import { execQuery } from '@/db/helpers';
import { eq, or } from 'drizzle-orm';
import { users } from '@/db/schema';
import { ActionError, unauthenticatedAction } from '@/lib/safe-action';
import { schema } from './validation';
import { redirect } from 'next/navigation';
import crypto from 'crypto';

export const signUpAction = unauthenticatedAction(
  schema,
  async ({ name, email, dni, cert }) => {
    const existingUser = await execQuery((db) =>
      db.query.users.findFirst({
        where: or(
          eq(users.email, email),
          eq(users.dni, dni),
          eq(users.cert, cert)
        ),
      })
    );

    if (existingUser) {
      // TODO: Afinar un fisco
      throw new ActionError('User already exists on database');
    }

    const publicKey = crypto
      .createPublicKey(cert)
      .export({ type: 'pkcs1', format: 'pem' })
      .toString();

    await execQuery((db) =>
      db.insert(users).values({ name, email, dni, cert, publicKey })
    );

    redirect('/login');
  }
);

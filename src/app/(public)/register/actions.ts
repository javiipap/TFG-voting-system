'use server';

import { execQuery } from '@/db/helpers';
import { eq, or } from 'drizzle-orm';
import { users } from '@/db/schema';
import { ActionError, unauthenticatedAction } from '@/lib/safe-action';
import { schema } from '@/app/(public)/register/validation';
import { redirect } from 'next/navigation';
import crypto from 'crypto';

export const signUpAction = unauthenticatedAction(
  schema,
  async ({ name, email, cert }) => {
    const existingUser = await execQuery((db) =>
      db.query.users.findFirst({
        where: or(eq(users.email, email), eq(users.cert, cert)),
      })
    );

    if (existingUser && existingUser.cert) {
      throw new ActionError('User already exists on database');
    }

    const publicKey = crypto
      .createPublicKey(cert)
      .export({ type: 'pkcs1', format: 'pem' })
      .toString();

    if (!existingUser) {
      await execQuery((db) =>
        db.insert(users).values({ name, email, cert, publicKey })
      );
    } else {
      await execQuery((db) =>
        db
          .update(users)
          .set({ name, cert, publicKey })
          .where(eq(users.email, email))
      );
    }

    redirect('/login');
  }
);

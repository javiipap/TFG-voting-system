import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Google from 'next-auth/providers/google';
import { getConnection, isAdmin } from './db/helpers';
import * as schema from './db/schema';
import { eq } from 'drizzle-orm';

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth({
  ...authConfig,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        if (profile?.email) {
          token.role = (await isAdmin(profile?.email)) ? 'admin' : 'user';
        } else {
          token.role = 'user';
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;

      return session;
    },
    async signIn({ user, account, profile }) {
      if (!account) return false;

      if (!user.email) {
        // redirect?
        return false;
      }

      const { client, db } = getConnection();
      const existingUser = await db.query.users.findFirst({
        where: eq(schema.users.email, user.email),
      });

      if (existingUser) {
        const registeredProfiles = await db.query.accounts.findMany({
          where: eq(schema.accounts.userId, existingUser.id),
        });

        const isProfileRegistered = registeredProfiles.some(
          (p) => p.providerAccountId === account.id
        );

        if (!isProfileRegistered) {
          await db.insert(schema.accounts).values({
            ...account,
            userId: existingUser.id,
          });
        }

        await client.end();
        return true;
      }

      const newUser = await db
        .insert(schema.users)
        .values({
          email: user.email,
          name: user.name,
          image: user.image,
        })
        .returning({ id: schema.users.id });

      await db.insert(schema.accounts).values({
        ...account,
        userId: newUser[0].id,
      });

      await client.end();
      return true;
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
});

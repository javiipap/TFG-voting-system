import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import CredentialsProvider from 'next-auth/providers/credentials';
import { execQuery, getAdmin, isAdmin } from './db/helpers';
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
    async jwt({ token, account, profile, trigger }) {
      if (account || trigger === 'update') {
        if (profile?.email && (await isAdmin(profile.email))) {
          token.role = 'admin';
          const admin = (await getAdmin(profile.email))!;
          token.adminId = admin.adminId;
        } else {
          token.role = 'user';
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.adminId = token.adminId;

      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: 'cert',
      credentials: {
        cert: {},
      },
      async authorize({ cert }) {
        const user = await execQuery((db) =>
          db.query.users.findFirst({
            where: eq(schema.users.cert, cert as string),
          })
        );

        if (!user) {
          return null;
        }

        return {
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
});

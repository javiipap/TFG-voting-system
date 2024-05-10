import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { execQuery, getAdminId, isAdmin } from '../db/helpers';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const userEmail = token.email as string;
        token.role = (await isAdmin(userEmail)) ? 'admin' : 'user';
        const adminId = await getAdminId(userEmail);
        token.adminId = adminId;
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

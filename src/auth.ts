import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Google from 'next-auth/providers/google';
import { isAdmin } from './db/helpers';

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
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
});

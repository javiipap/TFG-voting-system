import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  providers: [],
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login',
  },
} satisfies NextAuthConfig;

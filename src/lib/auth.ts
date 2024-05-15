import NextAuth, { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { execQuery, getAdminId, isAdmin } from '../db/helpers';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

type Role = 'admin' | 'user';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: User & {
      role: Role;
      adminId: number;
    };
  }

  interface User {
    pk: string;
    userId: number;
    email?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: number;
    role?: Role;
    adminId?: number | null;
    pk: string;
  }
}

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
        token.pk = user.pk;
        token.userId = user.userId;
      }

      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role as Role;
      session.user.adminId = token.adminId as number;
      session.user.pk = token.pk as string;
      session.user.userId = token.userId as number;

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

        if (!user || !user.publicKey || !user.cert) {
          return null;
        }

        return {
          userId: user.id,
          name: user.name,
          email: user.email,
          pk: user.publicKey,
        };
      },
    }),
  ],
});

export const getSessionSSR = async () => {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return session.user;
};

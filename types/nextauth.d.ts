import NextAuth, { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

type Role = 'admin' | 'user';

declare module 'next-auth' {
  interface Session {
    user: {
      role: Role;
      adminId: number | undefined;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role;
    adminId: number | undefined;
  }
}

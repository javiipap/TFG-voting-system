import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    DB_USER: z.string(),
    DB_PWD: z.string(),
    DB_NAME: z.string(),
    DB_HOST: z.string(),
    DB_PORT: z.string(),
    AUTH_SECRET: z.string(),
    ETH_ACCOUNT: z.string(),
    ETH_PRIV: z.string(),
  },
  client: {
    NEXT_PUBLIC_ETH_HOST: z.string(),
    NEXT_PUBLIC_AUTH_PROXY: z.string(),
    NEXT_PUBLIC_DOMAIN: z.string(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_ETH_HOST: process.env.NEXT_PUBLIC_ETH_HOST,
    NEXT_PUBLIC_AUTH_PROXY: process.env.NEXT_PUBLIC_AUTH_PROXY,
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
  },
});

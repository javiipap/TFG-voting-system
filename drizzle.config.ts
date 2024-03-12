import type { Config } from 'drizzle-kit';
export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    user: 'pi',
    password: 'password',
    host: '192.168.1.10',
    port: 5432,
    database: 'tfg',
  },
  verbose: true,
  strict: true,
} satisfies Config;

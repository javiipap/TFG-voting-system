import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

export const getConnection = () => {
  const client = postgres({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? ''),
    db: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PWD,
  });

  const db = drizzle(client, { schema });

  return { client, db };
};

export const execQuery = async <T>(
  fn: (db: PostgresJsDatabase<typeof schema>) => Promise<T>
) => {
  const { client, db } = getConnection();

  const result = await fn(db);

  await client.end();

  return result;
};

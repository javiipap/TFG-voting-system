import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

const globalForDb = globalThis as unknown as {
  _db?: PostgresJsDatabase<typeof schema>;
  _client?: postgres.Sql;
};

function getPool() {
  if (!globalForDb._client) {
    globalForDb._client = postgres({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? ''),
      db: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PWD,
      max: 20,
    });
    globalForDb._db = drizzle(globalForDb._client, { schema });
  }
  return { client: globalForDb._client, db: globalForDb._db! };
}

export const getConnection = () => getPool();

export const execQuery = async <T>(
  fn: (db: PostgresJsDatabase<typeof schema>) => Promise<T>
) => {
  const { db } = getPool();
  return await fn(db);
};

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

const getConnection = () => {
  const client = postgres('postgres://pi:password@192.168.1.10:5432/tfg');
  const db = drizzle(client, { schema });

  return db;
};

export const getBallot = async (slug: string) => {
  const db = getConnection();

  const ballot = await db.query.ballots.findFirst({
    where: eq(schema.ballots.slug, slug),
  });

  return ballot;
};

export const getBallots = async () => {
  const db = getConnection();

  const ballots = await db.query.ballots.findMany();

  return ballots;
};

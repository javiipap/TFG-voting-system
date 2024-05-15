import { execQuery } from '@/db/helpers';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

export const getCandidates = (id: number) =>
  execQuery((db) =>
    db.query.candidates.findMany({
      where: eq(schema.candidates.electionId, id),
    })
  );

export const addCandidate = async (
  candidate: typeof schema.candidates.$inferInsert
) => {
  return await execQuery((db) =>
    db.insert(schema.candidates).values(candidate)
  );
};

export const deleteCandidate = async (id: number) => {
  return await execQuery((db) =>
    db.delete(schema.candidates).where(eq(schema.candidates.id, id))
  );
};

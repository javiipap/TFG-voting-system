import { execQuery } from '@/db/helpers';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

export const getCandidates = (id: number) =>
  execQuery((db) =>
    db.query.candidates.findMany({ where: eq(schema.candidates.id, id) })
  );

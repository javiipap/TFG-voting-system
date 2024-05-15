import { z } from 'zod';

export const schema = z.object({
  candidateCount: z.number(),
  id: z.number(),
});

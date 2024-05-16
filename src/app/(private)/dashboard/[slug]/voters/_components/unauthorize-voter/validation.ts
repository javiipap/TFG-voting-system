import { z } from 'zod';

export const schema = z.object({
  userId: z.number(),
  electionId: z.number(),
  slug: z.string(),
});

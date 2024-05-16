import { z } from 'zod';

export const schema = z.object({
  electionId: z.number(),
  slug: z.string(),
});

import { z } from 'zod';

export const schema = z.object({
  name: z.string(),
  description: z.string(),
  electionId: z.number(),
  slug: z.string(),
});

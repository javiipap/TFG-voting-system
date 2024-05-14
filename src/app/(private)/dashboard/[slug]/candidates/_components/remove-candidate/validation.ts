import { z } from 'zod';

export const schema = z.object({
  slug: z.string(),
  id: z.number(),
  electionId: z.number(),
});

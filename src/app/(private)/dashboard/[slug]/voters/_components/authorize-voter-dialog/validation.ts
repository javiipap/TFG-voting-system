import { z } from 'zod';

export const schema = z.object({
  email: z.string().email(),
  electionId: z.number(),
  slug: z.string(),
});

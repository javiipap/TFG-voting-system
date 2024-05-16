import { z } from 'zod';

export const schema = z.object({
  slug: z.string(),
  candidates: z.array(
    z.object({
      id: z.number(),
      votes: z.number(),
    })
  ),
});

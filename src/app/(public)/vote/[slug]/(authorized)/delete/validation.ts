import { z } from 'zod';

export const schema = z.object({
  address: z.string().length(42),
  token: z.string().length(24),
  electionId: z.number(),
});

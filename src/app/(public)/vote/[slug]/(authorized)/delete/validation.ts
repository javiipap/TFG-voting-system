import { z } from 'zod';

export const schema = z.object({
  sk: z.string().length(66),
  electionId: z.number(),
  publicKey: z.string(),
  signature: z.string(),
  address: z.string(),
});

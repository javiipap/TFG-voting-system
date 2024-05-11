import { z } from 'zod';

export const schema = z.object({
  name: z.string(),
  description: z.string(),
  isPrivate: z.boolean(),
  from: z.date(),
  to: z.date(),
  start: z.string(),
  end: z.string(),
  masterPublicKey: z.string(),
});

import { z } from 'zod';

export const schema = z.object({
  ticket: z.string(),
});

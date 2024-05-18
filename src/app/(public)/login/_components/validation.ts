import { z } from 'zod';

export const schema = z.object({
  cert: z.string().min(1),
});

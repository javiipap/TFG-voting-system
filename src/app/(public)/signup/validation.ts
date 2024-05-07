import { z } from 'zod';

export const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  dni: z.string().min(1),
  cert: z.string(),
});

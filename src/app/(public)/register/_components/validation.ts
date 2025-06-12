import { z } from 'zod';

export const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  cert: z.string().min(1, "Couldn't retrieve client certificate"),
  publicKey: z.string().min(1, "Couldn't retrieve client pk"),
});

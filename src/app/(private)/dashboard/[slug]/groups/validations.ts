import { z } from 'zod';

export const schema = z.object({
  slug: z.string(),
  electionId: z.number(),
  groupId: z.string(),
});

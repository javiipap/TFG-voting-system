import { z } from 'zod';

export const schema = z.object({
  electionId: z.number(),
  blinded: z.string(),
  recoveryEthPrivateKey: z.string(),
  signature: z.string(),
});

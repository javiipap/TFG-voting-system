import { z } from 'zod';

export const schema = z.object({
  electionId: z.number(),
  blinded: z.string(),
  encryptedEthSecret: z.string(),
  recoveryEthSecret: z.string(),
});

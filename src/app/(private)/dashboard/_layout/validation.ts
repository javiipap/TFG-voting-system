import { z } from 'zod';

export const schema = z
  .object({
    name: z.string(),
    description: z.string(),
    isPrivate: z.boolean(),
    from: z.date(),
    to: z.date(),
    start: z.string(),
    end: z.string(),
    masterPublicKey: z.string(),
  })
  .refine(
    ({ start, end, from, to }) => {
      const startDate = new Date(from);
      const endDate = new Date(to);
      startDate.setHours(parseInt(start), 0, 0, 0);
      endDate.setHours(parseInt(end), 0, 0, 0);

      return startDate < endDate;
    },
    {
      message: 'La fecha de inicio no puede ser mayor que la final',
      path: ['from'],
    }
  )
  .refine(
    ({ start, from }) => {
      const startDate = new Date(from);
      startDate.setHours(parseInt(start), 0, 0, 0);

      return startDate > new Date();
    },
    {
      message: 'La fecha inicio debe ser mayor que la fecha actual',
      path: ['from'],
    }
  );

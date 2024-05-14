import { execQuery } from '@/db/helpers';
import * as schema from '@/db/schema';
import { eq, or } from 'drizzle-orm';

export type Job = typeof schema.jobs.$inferSelect;

export async function setJobStatus(
  jobId: number,
  status: schema.JobStatus,
  errorMsg?: any
) {
  const parsedMsg =
    status === 'error' ? `${errorMsg}` || 'Unkonwn error' : null;

  await execQuery((db) =>
    db
      .update(schema.jobs)
      .set({ status, errorMsg: parsedMsg })
      .where(eq(schema.jobs.id, jobId))
  );
}

export async function addJob(
  reference: string,
  handler: string,
  args: any,
  executionDate: Date
) {
  await execQuery((db) =>
    db.insert(schema.jobs).values({
      reference,
      handler,
      arguments: JSON.stringify(args),
      executionDate,
    })
  );
}

export async function getJobs() {
  return await execQuery((db) => db.query.jobs.findMany());
}

export async function getIdleJobs() {
  return await execQuery((db) =>
    db.query.jobs.findMany({
      where: or(
        eq(schema.jobs.status, 'idle'),
        eq(schema.jobs.status, 'error')
      ),
    })
  );
}

export async function getJob(jobId: number) {
  return await execQuery((db) =>
    db.query.jobs.findFirst({ where: eq(schema.jobs.id, jobId) })
  );
}

export async function getJobByReference(reference: string) {
  return await execQuery((db) =>
    db.query.jobs.findFirst({ where: eq(schema.jobs.reference, reference) })
  );
}

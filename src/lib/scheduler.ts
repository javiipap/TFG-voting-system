import { CronJob } from 'cron';
import * as deployContract from '@/jobs/deploy-contract';
import * as tally from '@/jobs/tally';
import {
  Job,
  addJob,
  getIdleJobs,
  getJobByReference,
  setJobStatus,
} from '@/data-access/jobs';

type Handler<T = any> = {
  handler: (arg: T) => Promise<void>;
  createReference: (arg: T) => string;
};

const handlers = {
  deploy_contract: {
    handler: deployContract.handler,
    createReference: deployContract.createReference,
  },
  tally: {
    handler: tally.handler,
    createReference: tally.createReference,
  },
} satisfies Record<string, Handler>;

const executeJob = async (job: Job, force = false) => {
  const now = new Date();
  const DELTA = 5 * 60 * 1000;

  if (Math.abs(job.executionDate.getTime() - now.getTime()) > DELTA && !force) {
    return;
  }

  const handler = job.handler as keyof typeof handlers;

  setJobStatus(job.id, 'executing');
  console.log(`[SCHEDULER]: Running job ${job.id}`);

  await handlers[handler].handler(JSON.parse(job.arguments as any));

  setJobStatus(job.id, 'success');
  console.log(`[SCHEDULER]: Successfully ran ${job.id}`);
};

const updateJobStatus = async (
  result: PromiseSettledResult<void>,
  jobId: number
) => {
  if (result.status === 'rejected') {
    console.log(`[SCHEDULER]: Error running ${jobId}: ${result.reason}`);
    setJobStatus(jobId, 'error', result.reason);
  }
};

const job = CronJob.from({
  cronTime: '*/5 * * * *',
  onTick: async () => {
    const jobs = await getIdleJobs();

    console.log(`[SCHEDULER]: There are ${jobs.length} idle jobs`);

    const result = await Promise.allSettled(jobs.map((job) => executeJob(job)));

    await Promise.allSettled(
      result.map((res, i) => updateJobStatus(res, jobs[i].id))
    );
  },
  timeZone: 'utc',
  runOnInit: true,
});

export function init() {
  job.start();
}

export async function schedule<T extends keyof typeof handlers>(
  handler: T,
  args: Parameters<(typeof handlers)[T]['handler']>[0],
  executionDate: Date
) {
  await addJob(
    handlers[handler].createReference(args),
    handler,
    args,
    executionDate
  );

  console.log(
    `[SCHEDULER]: Added new ${handler} (${JSON.stringify(
      args
    )}) job due to ${executionDate.toLocaleDateString()}`
  );
}

export async function forceExecution(reference: string) {
  const job = await getJobByReference(reference);

  if (!job) {
    throw new Error(`No job found with reference: ${reference}`);
  }

  try {
    await executeJob(job, true);
    setJobStatus(job.id, 'success');
  } catch (e) {
    setJobStatus(job.id, 'error', e);

    throw e;
  }
}

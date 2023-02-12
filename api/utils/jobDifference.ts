import { Jobs } from "../src/xata";

export const getJobsRemovedFromJapanDev = (
  jobsFromXataDb: Jobs[],
  jobListFromJapanDev: number[]
) => {
  return jobsFromXataDb.filter(
    (job) => !jobListFromJapanDev.includes(job.jobId as number)
  );
};

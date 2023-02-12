export const getJobsRemovedFromJapanDev = (jobsFromXataDb, jobListFromJapanDev) => {
    return jobsFromXataDb.filter((job) => !jobListFromJapanDev.includes(job.jobId));
};
//# sourceMappingURL=jobDifference.js.map
import { getXataClient } from "../src/xata";
import { Job } from "../types";

const xataClient = getXataClient();

export const jobsFromXata = xataClient.db.Jobs.getAll();

export const createJob = async (job: Job): Promise<void> => {
  const jobAttributes = job.attributes;
  await xataClient.db.Jobs.create({
    jobId: jobAttributes.id,
    jobTitle: jobAttributes.title,
    companyName: jobAttributes.company?.name,
    companyLocation: jobAttributes.company?.location,
    skills: jobAttributes.skills?.map((skill) => skill.name).join(" "),
    jobLocation: jobAttributes.location,
    minSalary: jobAttributes.salary_min,
    maxSalary: jobAttributes.salary_max,
    applicationEmail: jobAttributes.application_email,
    applicationUrl: jobAttributes.application_url,
    postedDate: jobAttributes.job_post_date,
    japaneseLevel: jobAttributes.japanese_level_enum?.replaceAll("-", " "),
    remote: jobAttributes.remote_level?.replaceAll("-", " "),
    candidateLocation: jobAttributes.candidate_location?.replaceAll("-", " "),
    japaneseOnly: jobAttributes.is_japanese_only,
    internship: jobAttributes.is_internship,
    published: jobAttributes.published_at,
    updated: jobAttributes.updated_at,
  });
};

export const createManyJobs = async (jobList: Job[]): Promise<void> => {
  for (const job of jobList) {
    const jobAttributes = job.attributes;
    await xataClient.db.Jobs.create({
      jobId: jobAttributes.id,
      jobTitle: jobAttributes.title,
      companyName: jobAttributes.company?.name,
      companyLocation: jobAttributes.company?.location,
      skills: jobAttributes.skills?.map((skill) => skill.name).join(" "),
      jobLocation: jobAttributes.location,
      minSalary: jobAttributes.salary_min,
      maxSalary: jobAttributes.salary_max,
      applicationEmail: jobAttributes.application_email,
      applicationUrl: jobAttributes.application_url,
      postedDate: jobAttributes.job_post_date,
      japaneseLevel: jobAttributes.japanese_level_enum?.replaceAll("-", " "),
      remote: jobAttributes.remote_level?.replaceAll("-", " "),
      candidateLocation: jobAttributes.candidate_location?.replaceAll("-", " "),
      japaneseOnly: jobAttributes.is_japanese_only,
      internship: jobAttributes.is_internship,
      published: jobAttributes.published_at,
      updated: jobAttributes.updated_at,
    });
  }
};

export const deleteJob = async (jobId: string): Promise<void> => {
  await xataClient.db.Jobs.delete(jobId);
};

export const deleteManyJobs = async (jobIds: string[]): Promise<void> => {
  for (const jobId of jobIds) {
    await xataClient.db.Jobs.delete(jobId);
  }
};

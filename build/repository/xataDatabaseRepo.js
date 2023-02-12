import { getXataClient } from "../src/xata";
const xataClient = getXataClient();
export const getJobsFromXata = async () => await xataClient.db.Jobs.getAll();
export const createJob = async (job) => {
    var _a, _b, _c, _d, _e, _f;
    const jobAttributes = job.attributes;
    await xataClient.db.Jobs.create({
        jobId: jobAttributes.id,
        jobTitle: jobAttributes.title,
        companyName: (_a = jobAttributes.company) === null || _a === void 0 ? void 0 : _a.name,
        companyLocation: (_b = jobAttributes.company) === null || _b === void 0 ? void 0 : _b.location,
        skills: (_c = jobAttributes.skills) === null || _c === void 0 ? void 0 : _c.map((skill) => skill.name).join(" "),
        jobLocation: jobAttributes.location,
        minSalary: jobAttributes.salary_min,
        maxSalary: jobAttributes.salary_max,
        applicationEmail: jobAttributes.application_email,
        applicationUrl: jobAttributes.application_url,
        postedDate: jobAttributes.job_post_date,
        japaneseLevel: (_d = jobAttributes.japanese_level_enum) === null || _d === void 0 ? void 0 : _d.replaceAll("-", " "),
        remote: (_e = jobAttributes.remote_level) === null || _e === void 0 ? void 0 : _e.replaceAll("-", " "),
        candidateLocation: (_f = jobAttributes.candidate_location) === null || _f === void 0 ? void 0 : _f.replaceAll("-", " "),
        japaneseOnly: jobAttributes.is_japanese_only,
        internship: jobAttributes.is_internship,
        published: jobAttributes.published_at,
        updated: jobAttributes.updated_at,
    });
};
export const createManyJobs = async (jobList) => {
    var _a, _b, _c, _d, _e, _f;
    for (const job of jobList) {
        const jobAttributes = job.attributes;
        await xataClient.db.Jobs.create({
            jobId: jobAttributes.id,
            jobTitle: jobAttributes.title,
            companyName: (_a = jobAttributes.company) === null || _a === void 0 ? void 0 : _a.name,
            companyLocation: (_b = jobAttributes.company) === null || _b === void 0 ? void 0 : _b.location,
            skills: (_c = jobAttributes.skills) === null || _c === void 0 ? void 0 : _c.map((skill) => skill.name).join(" "),
            jobLocation: jobAttributes.location,
            minSalary: jobAttributes.salary_min,
            maxSalary: jobAttributes.salary_max,
            applicationEmail: jobAttributes.application_email,
            applicationUrl: jobAttributes.application_url,
            postedDate: jobAttributes.job_post_date,
            japaneseLevel: (_d = jobAttributes.japanese_level_enum) === null || _d === void 0 ? void 0 : _d.replaceAll("-", " "),
            remote: (_e = jobAttributes.remote_level) === null || _e === void 0 ? void 0 : _e.replaceAll("-", " "),
            candidateLocation: (_f = jobAttributes.candidate_location) === null || _f === void 0 ? void 0 : _f.replaceAll("-", " "),
            japaneseOnly: jobAttributes.is_japanese_only,
            internship: jobAttributes.is_internship,
            published: jobAttributes.published_at,
            updated: jobAttributes.updated_at,
        });
    }
};
export const deleteJob = async (jobId) => {
    await xataClient.db.Jobs.delete(jobId);
};
export const deleteManyJobs = async (jobIds) => {
    for (const jobId of jobIds) {
        await xataClient.db.Jobs.delete(jobId);
    }
};
//# sourceMappingURL=xataDatabaseRepo.js.map
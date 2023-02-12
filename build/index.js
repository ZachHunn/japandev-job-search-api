import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import { createJob, createManyJobs, deleteManyJobs, getJobsFromXata, getJobIdsFromXata, } from "./repository/xataDatabaseRepo";
import { getJobsRemovedFromJapanDev } from "./utils/jobDifference";
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
const japanDevUrl = "https://api.japan-dev.com/api/v1/jobs?limit=300";
const getJobsFromJapanDev = async () => {
    const response = await axios.get(japanDevUrl);
    if (response.status !== 200) {
        throw new Error("Something went wrong trying to jobs from Japan Dev");
    }
    return response.data.data;
};
app.use("/", express.static("public"));
app.get("/api/jobs", async (req, res) => {
    res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
    if (req.method !== "GET") {
        throw new Error("Method not allowed");
    }
    try {
        const jobList = await getJobsFromXata();
        res.status(200).json({ data: jobList });
    }
    catch (e) {
        res.status(500).send({ err: "Error getting jobs from the database" });
    }
});
app.post("/api/jobs/create", async (req, res) => {
    if (req.method !== "POST") {
        throw new Error("Method not allowed");
    }
    try {
        const jobIdsFromXata = await getJobIdsFromXata();
        const jobsFromJapanDev = await getJobsFromJapanDev();
        if (jobIdsFromXata.length === 0) {
            console.log("Xata Database is empty. Populating datbase with jobs from japan-dev.com");
            await createManyJobs(jobsFromJapanDev);
            res.status(200).send({
                data: `${jobsFromJapanDev.length} Jobs from Japan-Dev have been added to notion database`,
            });
        }
        else {
            console.log("Xata Datbase is not empty. Checking to see if any new jobs have been added to Japan-Dev");
            const jobsNotIncludedInXata = jobsFromJapanDev.filter((job) => {
                const jobId = job.attributes.id;
                if (jobIdsFromXata.includes(jobId)) {
                    return null;
                }
                return job;
            });
            if (jobsNotIncludedInXata.length === 0) {
                console.log("No new jobs have been added");
                res.status(200).json({ data: "No New Jobs Found!" });
            }
            else {
                if (jobsNotIncludedInXata.length === 1) {
                    const job = jobsNotIncludedInXata[0];
                    await createJob(job);
                }
                await createManyJobs(jobsNotIncludedInXata);
                res.status(200).json({
                    data: `${jobsNotIncludedInXata.length} new jobs have been found! Adding them to the xata database`,
                });
            }
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            err: "Something went wrong! Xata Database could not be updated!",
        });
    }
});
app.delete("/api/jobs/delete", async (req, res) => {
    if (req.method !== "DELETE") {
        throw new Error("Method not allowed");
    }
    const jobsFromJapanDev = await getJobsFromJapanDev();
    const jobIdsFromJapanDev = jobsFromJapanDev.map((job) => job.attributes.id);
    const jobListFromXata = await getJobsFromXata();
    const jobsRemovedFromJapanDev = getJobsRemovedFromJapanDev(jobListFromXata, jobIdsFromJapanDev);
    if (jobsRemovedFromJapanDev.length === 0) {
        res.json({
            data: `There are ${jobsRemovedFromJapanDev.length} stale jobs to delete from the database`,
        });
    }
    else {
        try {
            const jobIdsToRemoveFromXata = jobsRemovedFromJapanDev.map((job) => job.id);
            await deleteManyJobs(jobIdsToRemoveFromXata);
            res.status(200).send({
                data: `${jobIdsToRemoveFromXata.length} stale jobs have been removed from the Xata Database`,
            });
        }
        catch (error) {
            console.error(error);
            res
                .status(500)
                .json({ err: "There was an error deleting jobs from the database" });
        }
    }
});
export default app;
//# sourceMappingURL=index.js.map
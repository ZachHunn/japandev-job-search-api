import axios from "axios";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import {
  createJob,
  createManyJobs,
  deleteManyJobs,
  jobsFromXata,
} from "../repository/xataDatabaseRepo";
import { Job } from "../types";
import { getJobsRemovedFromJapanDev } from "../utils/jobDifference";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});

type MyReponse<T> =
  | {
      err: string;
    }
  | { data: T };

const japanDevUrl = "https://api.japan-dev.com/api/v1/jobs?limit=300";
const response = await axios.get(japanDevUrl);
const jobsFromJapanDev: Job[] = response.data.data;
const jobIdsFromXata = (await jobsFromXata).map((job) => job.jobId);

app.get(
  "/api/jobs",
  async (req: Request, res: Response<MyReponse<Job[] | string>>) => {
    if (req.method !== "GET") {
      return res.status(405).send({ err: "Method Not Allowed" });
    }

    if (response.status !== 200) {
      console.log(response.status);
      throw new Error("Something went wrong trying to get the resource");
    }
    try {
      if (jobIdsFromXata.length === 0) {
        console.log(
          "Xata Database is empty. Populating datbase with jobs from japan-dev.com"
        );
        await createManyJobs(jobsFromJapanDev);
        res.status(200).send({
          data: `${jobsFromJapanDev.length} Jobs from Japan-Dev have been added to notion database`,
        });
      } else {
        console.log(
          "Xata Datbase is not empty. Checking to see if any new jobs have been added to Japan-Dev"
        );

        const jobsNotIncludedInXata: Job[] = jobsFromJapanDev.filter((job) => {
          const jobId = job.attributes.id;
          if (jobIdsFromXata.includes(jobId)) {
            return null;
          }
          return job;
        });

        if (jobsNotIncludedInXata.length === 0) {
          console.log("No new jobs have been added");
          res.status(200).send({ data: "No New Jobs Found!" });
        } else {
          if (jobsNotIncludedInXata.length === 1) {
            const job = jobsNotIncludedInXata[0];
            await createJob(job);
          }
          await createManyJobs(jobsNotIncludedInXata);
          res.status(200).send({
            data: `${jobsNotIncludedInXata.length} new jobs have been found! Adding them to the xata database`,
          });
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        err: "Something went wrong! Xata Database could not be updated!",
      });
    }
  }
);

app.delete(
  "/api/jobs/delete",
  async (req: Request, res: Response<MyReponse<Job[] | string>>) => {
    if (req.method !== "DELETE") {
      return res.status(405).send({ err: "Method Not Allowed" });
    }
    const jobIdsFromJapanDev = jobsFromJapanDev.map((job) => job.attributes.id);
    const jobsRemovedFromJapanDev = getJobsRemovedFromJapanDev(
      await jobsFromXata,
      jobIdsFromJapanDev as number[]
    );

    if (jobsRemovedFromJapanDev.length === 0) {
      res.send({
        data: `There are ${jobsRemovedFromJapanDev.length} jobs to delete from the database`,
      });
    } else {
      try {
        const jobIdsToRemoveFromXata = jobsRemovedFromJapanDev.map(
          (job) => job.id
        );
        await deleteManyJobs(jobIdsToRemoveFromXata);
        res.status(200).send({
          data: `${jobIdsToRemoveFromXata.length} jobs have been removed from the Xata Database`,
        });
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ err: "There was an error deleting jobs from the database" });
      }
    }
  }
);
export default app;

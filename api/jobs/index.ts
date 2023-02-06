import axios from "axios";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import {
  createJob,
  createManyJobs,
  jobsFromXata,
} from "../repository/xataDatabaseRepo";
import { Job } from "../types";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});

const japanDevUrl = "https://api.japan-dev.com/api/v1/jobs?limit=300";

type MyReponse<T> =
  | {
      err: string;
    }
  | { data: T };

app.get(
  "/api/jobs",
  async (req: Request, res: Response<MyReponse<Job[] | string>>) => {
    if (req.method !== "GET") {
      return res.status(405).send({ err: "Method Not Allowed" });
    }
    const response = await axios.get(japanDevUrl);

    if (response.status !== 200) {
      console.log(response.status);
      throw new Error("Something went wrong trying to get the resource");
    }
    try {
      const jobsFromJapanDev: Job[] = response.data.data;
      const jobIdsFromXata = jobsFromXata.map((job) => job.jobId);

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
      console.log(error);
      res.status(500).json({
        err: "Something went wrong! Xata Database could not be updated!",
      });
    }
  }
);

export default app;

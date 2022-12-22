import {
  PageObjectResponse,
  PartialPageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import axios from "axios";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import {
  queryNotionDatabase,
  retreiveNotionPageProperties,
  createNotionDatabasePages,
} from "./repository/notionDatabaseRepo";
import { Job } from "./types";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});

const japanDevUrl = process.env.JAPAN_DEV_URL as string;
const databaseId = process.env.NOTION_DATABASE_ID as string;
const propertyId = process.env.NOTION_ID_PROPERTY as string;

async function getJobIds() {
  let propertyIdQuery: number[] = [];

  let results: (PageObjectResponse | PartialPageObjectResponse)[] = [];

  let databaseQuery = await queryNotionDatabase(databaseId);

  results = [...databaseQuery.results];

  while (databaseQuery.has_more) {
    const nextCursor = databaseQuery.next_cursor as string;
    databaseQuery = await queryNotionDatabase(databaseId, nextCursor);
    results = [...results, ...databaseQuery.results];
  }

  await Promise.all(
    results
      .map((page) => page.id)
      .map(async (pageId) => {
        const page = await retreiveNotionPageProperties(pageId, propertyId);
        const jobId: number = Object.values(page).pop();
        propertyIdQuery = [...propertyIdQuery, jobId];
      })
  );
  return propertyIdQuery;
}

type MyReponse<T> =
  | {
      err: string;
    }
  | { data: T };

app.get(
  "/api",
  async (req: Request, res: Response<MyReponse<Job[] | string>>) => {
    if (req.method !== "GET") {
      return res.status(405).json({ err: "Method Not Allowed" });
    }
    const response = await axios.get(japanDevUrl);

    if (response.status !== 200) {
      console.log(response.status);
      throw new Error("Something went wrong trying to get the resource");
    }
    try {
      const jobsFromJapanDev: Job[] = response.data.data;
      const numberOfJobsFromJapanDev: number = jobsFromJapanDev.length;
      const jobIdsFromNotion = await getJobIds();

      if (jobIdsFromNotion.length === 0) {
        console.log(
          "Notion Database is empty. Populating datbase with jobs from japan-dev.com"
        );
        await createNotionDatabasePages(jobsFromJapanDev, databaseId);
        res.status(200).send({
          data: `${numberOfJobsFromJapanDev} Jobs from Japan-Dev have been added to notion database`,
        });
      } else {
        console.log(
          "Notion Datbase is not empty. Checking to see if any new jobs have been added to Japan-Dev"
        );

        const jobsNotIncludedInNotion = jobsFromJapanDev.filter((job) => {
          const jobId = job.attributes.id as unknown as number;

          if (jobIdsFromNotion.includes(jobId)) {
            return null;
          }
          return job;
        });
        const numberOfJobsFound: number = jobsNotIncludedInNotion.length;
        if (jobsNotIncludedInNotion.length === 0) {
          console.log("No new jobs have been added");
          res.status(200).send({ data: "No New Jobs Found!" });
        } else {
          await createNotionDatabasePages(jobsNotIncludedInNotion, databaseId);

          res.status(200).send({
            data: `${numberOfJobsFound} new jobs have been found! Adding them to the notion database`,
          });
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        err: "Something went wrong! Notion Database could not be updated!",
      });
    }
  }
);

export default app;

import express, { Express, Request, Response } from "express";
import axios from "axios";
import { Job } from "./utils/types";
import { notion } from "./utils/notionClient";
import dotenv from "dotenv";

dotenv.config();
const app: Express = express();
const port = 3000;

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});

const japanDevUrl = "https://api.japan-dev.com/api/v1/jobs";
const databaseId = process.env.NOTION_DATABASE_ID as string;


const getId = notion.databases
  .query({
    database_id: databaseId,
  })
  .then((value) => Promise.resolve(value.results));

console.log(getId)
app.get("/", async (req, res) => {
  const data: Job[] = await axios.get(japanDevUrl).then((response) => {
    return response.data.data;
  });

  data.forEach(async (job: Job) => {
    const jobAttributes = job.attributes;
    notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        ["ID"]: {
          number: jobAttributes.id as number,
        },
        ["Company Name"]: {
          rich_text: [
            {
              text: {
                content: jobAttributes.company?.name as string,
              },
            },
          ],
        },
        ["Company Location"]: {
          rich_text: [
            {
              text: {
                content: jobAttributes.company?.location as string,
              },
            },
          ],
        },
        ["Job Title"]: {
          title: [
            {
              text: {
                content: jobAttributes.title as string,
              },
            },
          ],
        },
        ["Skills"]: {
          rich_text: [
            {
              text: {
                content: jobAttributes.skills
                  ?.map((skill) => skill.name)
                  .join(" ") as string,
              },
            },
          ],
        },
        ["Job Location"]: {
          rich_text: [
            {
              text: {
                content: jobAttributes.location as string,
              },
            },
          ],
        },
        ["Min Salary"]: {
          number: jobAttributes.salary_min as number,
        },
        ["Max Salary"]: {
          number: jobAttributes.salary_max as number,
        },
        ["Application Email"]: {
          email: jobAttributes.application_email
            ? (jobAttributes.application_email )
            : "N/A",
        },
        ["Application URL"]: {
          url: jobAttributes.application_url
            ? jobAttributes.application_url
            : "N/A",
        },
        ["Posted Date"]: {
          rich_text: [
            {
              text: {
                content: jobAttributes.job_post_date as string,
              },
            },
          ],
        },
        ["Japanese Level"]: {
          rich_text: [
            {
              text: {
                content: jobAttributes.japanese_level_enum?.replaceAll(
                  "_",
                  " "
                ) as string,
              },
            },
          ],
        },
        ["Remote"]: {
          rich_text: [
            {
              text: {
                content: jobAttributes.remote_level?.replaceAll(
                  "_",
                  " "
                ) as string,
              },
            },
          ],
        },
        ["Candidate Location"]: {
          rich_text: [
            {
              text: {
                content: jobAttributes.candidate_location?.replaceAll(
                  "_",
                  " "
                ) as string,
              },
            },
          ],
        },
        ["Japanese Only"]: {
          rich_text: [
            {
              text: {
                content: String(jobAttributes.is_japanese_only),
              },
            },
          ],
        },
        ["Internship"]: {
          rich_text: [
            {
              text: {
                content: String(jobAttributes.is_internship),
              },
            },
          ],
        },
        ["Published"]: {
          date: {
            start: jobAttributes.published_at as string,
          },
        },
        Updated: {
          date: {
            start: jobAttributes.updated_at as string,
          },
        },
      },
    });
  });
  res.status(200).send(data);
});

import {
  QueryDatabaseResponse,
  GetPagePropertyResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { notion } from "./utils/notionClient";
import { Job } from "./types";

export const queryNotionDatabase = async (
  databaseId: string,
  startCursor?: string
): Promise<QueryDatabaseResponse> => {
  return await notion.databases.query({
    database_id: databaseId,
    start_cursor: startCursor,
  });
};

export const retreiveNotionPageProperties = async (
  pageId: string,
  propertyId: string,
  pageSize = 100
): Promise<GetPagePropertyResponse> => {
  return await notion.pages.properties.retrieve({
    page_id: pageId,
    property_id: propertyId,
    page_size: pageSize,
  });
};
export const createNotionDatabasePages = async (
  jobList: Job[],
  databaseId: string
) => {
  for (const job of jobList) {
    const jobAttributes = job.attributes;
    await notion.pages.create({
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
            ? jobAttributes.application_email
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
  }
};

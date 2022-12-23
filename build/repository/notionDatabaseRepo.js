import { notion } from "../utils/notionClient";
export const queryNotionDatabase = async (databaseId, startCursor) => {
    return await notion.databases.query({
        database_id: databaseId,
        start_cursor: startCursor,
    });
};
export const retreiveNotionPageProperties = async (pageId, propertyId, pageSize = 100) => {
    return await notion.pages.properties.retrieve({
        page_id: pageId,
        property_id: propertyId,
        page_size: pageSize,
    });
};
export const createNotionDatabasePages = async (jobList, databaseId) => {
    console.log(jobList);
    console.log(databaseId);
    jobList.forEach(async (job) => {
        var _a, _b, _c, _d, _e, _f;
        const jobAttributes = job.attributes;
        await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                ["ID"]: {
                    number: jobAttributes.id,
                },
                ["Company Name"]: {
                    rich_text: [
                        {
                            text: {
                                content: (_a = jobAttributes.company) === null || _a === void 0 ? void 0 : _a.name,
                            },
                        },
                    ],
                },
                ["Company Location"]: {
                    rich_text: [
                        {
                            text: {
                                content: (_b = jobAttributes.company) === null || _b === void 0 ? void 0 : _b.location,
                            },
                        },
                    ],
                },
                ["Job Title"]: {
                    title: [
                        {
                            text: {
                                content: jobAttributes.title,
                            },
                        },
                    ],
                },
                ["Skills"]: {
                    rich_text: [
                        {
                            text: {
                                content: (_c = jobAttributes.skills) === null || _c === void 0 ? void 0 : _c.map((skill) => skill.name).join(" "),
                            },
                        },
                    ],
                },
                ["Job Location"]: {
                    rich_text: [
                        {
                            text: {
                                content: jobAttributes.location,
                            },
                        },
                    ],
                },
                ["Min Salary"]: {
                    number: jobAttributes.salary_min,
                },
                ["Max Salary"]: {
                    number: jobAttributes.salary_max,
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
                                content: jobAttributes.job_post_date,
                            },
                        },
                    ],
                },
                ["Japanese Level"]: {
                    rich_text: [
                        {
                            text: {
                                content: (_d = jobAttributes.japanese_level_enum) === null || _d === void 0 ? void 0 : _d.replaceAll("_", " "),
                            },
                        },
                    ],
                },
                ["Remote"]: {
                    rich_text: [
                        {
                            text: {
                                content: (_e = jobAttributes.remote_level) === null || _e === void 0 ? void 0 : _e.replaceAll("_", " "),
                            },
                        },
                    ],
                },
                ["Candidate Location"]: {
                    rich_text: [
                        {
                            text: {
                                content: (_f = jobAttributes.candidate_location) === null || _f === void 0 ? void 0 : _f.replaceAll("_", " "),
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
                        start: jobAttributes.published_at,
                    },
                },
                Updated: {
                    date: {
                        start: jobAttributes.updated_at,
                    },
                },
            },
        });
        console.log(`After the foreach! Created entry for ${jobAttributes.title}`);
    });
};
//# sourceMappingURL=notionDatabaseRepo.js.map
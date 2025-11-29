// netlify/functions/ai-stillcut-request.js
const { Client } = require("@notionhq/client");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_KEY;
    const STILL_DB =
      process.env.NOTION_STILLCUT_DB ||
      process.env.NOTION_DB_STILLCUT ||
      process.env.STILLCUT_DB_ID;

    if (!NOTION_TOKEN || !STILL_DB) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          ok: false,
          error:
            "환경변수 NOTION_TOKEN(or NOTION_KEY) / NOTION_STILLCUT_DB 를 확인해 주세요.",
        }),
      };
    }

    const notion = new Client({ auth: NOTION_TOKEN });
    const data = JSON.parse(event.body || "{}");

    const {
      Title,
      ProjectTitle,
      Phone,
      Email,
      VideoType,
      Runtime,
      Budget,
      ShootDate,
      Location,
      ReferenceLink,
      Message,
    } = data;

    const properties = {
      Title: {
        title: [{ text: { content: Title || "AI Stillcut Request" } }],
      },
      ProjectTitle: ProjectTitle
        ? { rich_text: [{ text: { content: ProjectTitle } }] }
        : undefined,
      Phone: Phone
        ? { rich_text: [{ text: { content: Phone } }] }
        : undefined,
      Email: Email
        ? { rich_text: [{ text: { content: Email } }] }
        : undefined,
      VideoType: VideoType
        ? { rich_text: [{ text: { content: VideoType } }] }
        : undefined,
      Runtime: Runtime
        ? { rich_text: [{ text: { content: Runtime } }] }
        : undefined,
      Budget: Budget
        ? { rich_text: [{ text: { content: Budget } }] }
        : undefined,
      ShootDate: ShootDate
        ? { date: { start: ShootDate } }
        : undefined,
      Location: Location
        ? { rich_text: [{ text: { content: Location } }] }
        : undefined,
      ReferenceLink: ReferenceLink
        ? { url: ReferenceLink }
        : undefined,
      Message: Message
        ? { rich_text: [{ text: { content: Message } }] }
        : undefined,
      Status: { select: { name: "신규" } },
    };

    Object.keys(properties).forEach((k) => {
      if (properties[k] === undefined) delete properties[k];
    });

    await notion.pages.create({
      parent: { database_id: STILL_DB },
      properties,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error("ai-stillcut-request error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: err.message || "알 수 없는 오류",
      }),
    };
  }
};
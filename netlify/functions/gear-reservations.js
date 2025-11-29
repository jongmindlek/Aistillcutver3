// netlify/functions/gear-reservations.js
const { Client } = require("@notionhq/client");

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_KEY;
    const GEAR_DB = process.env.NOTION_GEAR_DB;

    if (!NOTION_TOKEN || !GEAR_DB) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          ok: false,
          error:
            "환경변수 NOTION_TOKEN / NOTION_GEAR_DB 를 확인해 주세요.",
        }),
      };
    }

    const gearName = event.queryStringParameters?.gear || null;

    const notion = new Client({ auth: NOTION_TOKEN });

    const filter = gearName
      ? {
          and: [
            {
              property: "GearName",
              rich_text: { contains: gearName },
            },
          ],
        }
      : undefined;

    const response = await notion.databases.query({
      database_id: GEAR_DB,
      page_size: 100,
      filter,
    });

    const items = response.results.map((page) => {
      const props = page.properties || {};
      const name =
        props.GearName?.rich_text?.[0]?.plain_text || "Unknown";
      const start = props.StartDate?.date?.start || null;
      const end = props.EndDate?.date?.end || props.EndDate?.date?.start || null;

      return { gearName: name, start, end };
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, items }),
    };
  } catch (err) {
    console.error("gear-reservations error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: err.message || "알 수 없는 오류",
      }),
    };
  }
};
// netlify/functions/works-list.js
const { Client } = require("@notionhq/client");

exports.handler = async () => {
  try {
    const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_KEY;
    const WORK_DB =
      process.env.NOTION_WORK_DB ||
      process.env.NOTION_DB_WORK ||
      process.env.WORK_DB_ID;

    if (!NOTION_TOKEN || !WORK_DB) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          ok: false,
          error:
            "환경변수 NOTION_TOKEN(or NOTION_KEY) / NOTION_WORK_DB 를 확인해 주세요.",
        }),
      };
    }

    const notion = new Client({ auth: NOTION_TOKEN });

    const response = await notion.databases.query({
      database_id: WORK_DB,
      page_size: 30,
    });

    const items = response.results.map((page) => {
      const props = page.properties || {};

      let title = "Untitled";
      if (props.Title?.title?.length) {
        title = props.Title.title[0].plain_text;
      } else if (props.Name?.title?.length) {
        title = props.Name.title[0].plain_text;
      }

      const client = props.Client?.rich_text?.[0]?.plain_text || "";

      let type = "";
      if (props.Type?.select?.name) type = props.Type.select.name;
      else if (props.Type?.rich_text?.[0]?.plain_text)
        type = props.Type.rich_text[0].plain_text;

      const year =
        typeof props.Year?.number === "number" ? props.Year.number : null;

      const url = props.URL?.url || props.Link?.url || null;

      return { title, client, type, year, url };
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, items }),
    };
  } catch (err) {
    console.error("works-list error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: err.message || "알 수 없는 오류",
      }),
    };
  }
};
// netlify/functions/works-list.js
const { Client } = require("@notionhq/client");

exports.handler = async () => {
  try {
    const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_KEY;
    const WORK_DB = process.env.NOTION_WORK_DB; // Recent Work DB ID

    if (!NOTION_TOKEN || !WORK_DB) {
      // 프론트에서 그냥 "워크를 불러오지 못했습니다" 정도만 보여주도록 함
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: false, errorCode: "ENV_MISSING" }),
      };
    }

    const notion = new Client({ auth: NOTION_TOKEN });

    const response = await notion.databases.query({
      database_id: WORK_DB,
      page_size: 30,
      filter: {
        property: "Published",
        checkbox: { equals: true },
      },
      sorts: [
        {
          property: "Sort",
          direction: "ascending",
        },
      ],
    });

    const items = response.results.map((page) => {
      const props = page.properties || {};

      // Title
      let title = "Untitled";
      if (props.Title?.title?.length) {
        title = props.Title.title[0].plain_text;
      }

      const subtitle = props.SubTitle?.rich_text?.[0]?.plain_text || "";
      const roleLabel = props.RoleLabel?.rich_text?.[0]?.plain_text || "";
      const roleName = props.RoleName?.rich_text?.[0]?.plain_text || "";

      const thumbnailUrl = props.ThumbnailUrl?.url || null;

      const sort =
        typeof props.Sort?.number === "number" ? props.Sort.number : null;

      return {
        title,
        subtitle,
        roleLabel,
        roleName,
        thumbnailUrl,
        sort,
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, items }),
    };
  } catch (err) {
    console.error("works-list error:", err);
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: false, errorCode: "UNKNOWN" }),
    };
  }
};
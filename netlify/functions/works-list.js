// netlify/functions/works-list.js
const { Client } = require("@notionhq/client");

exports.handler = async () => {
  try {
    const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_KEY;

    // ✅ 너가 쓰는 이름 + 내가 쓴 이름 둘 다 지원
    const WORK_DB =
      process.env.NOTION_WORK_DB ||
      process.env.NOTION_WORKS_DB_ID; // ← 캡처에서 보인 이름

    if (!NOTION_TOKEN || !WORK_DB) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: false,
          errorCode: "ENV_MISSING",
          message:
            "NOTION_TOKEN 또는 NOTION_WORK_DB / NOTION_WORKS_DB_ID 환경변수를 확인해 주세요.",
        }),
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
      const p = page.properties || {};

      return {
        title: p.Title?.title?.[0]?.plain_text || "",
        subtitle: p.SubTitle?.rich_text?.[0]?.plain_text || "",
        roleLabel: p.RoleLabel?.rich_text?.[0]?.plain_text || "",
        roleName: p.RoleName?.rich_text?.[0]?.plain_text || "",
        thumbnailUrl: p.ThumbnailUrl?.url || "",
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
      body: JSON.stringify({
        ok: false,
        errorCode: "UNKNOWN",
        message: "Recent Work를 불러오는 중 오류가 발생했습니다.",
      }),
    };
  }
};
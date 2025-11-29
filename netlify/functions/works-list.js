const { Client } = require("@notionhq/client");

exports.handler = async () => {
  try {
    const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_KEY;

    const WORK_DB =
      process.env.NOTION_WORK_DB ||
      process.env.NOTION_WORKS_DB_ID;

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

      const title = p.Title?.title?.[0]?.plain_text || "";
      const subtitle = p.SubTitle?.rich_text?.[0]?.plain_text || "";
      const roleLabel = p.RoleLabel?.rich_text?.[0]?.plain_text || "";
      const roleName = p.RoleName?.rich_text?.[0]?.plain_text || "";

      let thumbnailUrl = "";
      const thumbProp = p.ThumbnailUrl;
      if (thumbProp) {
        if (thumbProp.url) thumbnailUrl = thumbProp.url;
        if (!thumbnailUrl && Array.isArray(thumbProp.files) && thumbProp.files.length) {
          const file = thumbProp.files[0];
          if (file.external?.url) thumbnailUrl = file.external.url;
          else if (file.file?.url) thumbnailUrl = file.file.url;
        }
      }

      return {
        title,
        subtitle,
        roleLabel,
        roleName,
        thumbnailUrl,
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
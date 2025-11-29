// netlify/functions/works-list.js
const { Client } = require("@notionhq/client");

exports.handler = async () => {
  try {
    const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_KEY;

    // 너 환경변수 이름들 다 대응
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

      // 제목/텍스트
      const title = p.Title?.title?.[0]?.plain_text || "";
      const subtitle = p.SubTitle?.rich_text?.[0]?.plain_text || "";
      const roleLabel = p.RoleLabel?.rich_text?.[0]?.plain_text || "";
      const roleName = p.RoleName?.rich_text?.[0]?.plain_text || "";

      // 🔥 ThumbnailUrl 처리 (URL 타입 + 파일 & 미디어 타입 모두 지원)
      let thumbnailUrl = "";

      const thumbProp = p.ThumbnailUrl;

      if (thumbProp) {
        // 1) URL 타입 (property type: url)
        if (thumbProp.url) {
          thumbnailUrl = thumbProp.url;
        }

        // 2) 파일 & 미디어 타입 (property type: files)
        if (!thumbnailUrl && Array.isArray(thumbProp.files) && thumbProp.files.length) {
          const file = thumbProp.files[0];
          // 외부 링크
          if (file.external?.url) {
            thumbnailUrl = file.external.url;
          }
          // Notion에 업로드된 파일
          else if (file.file?.url) {
            thumbnailUrl = file.file.url;
          }
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
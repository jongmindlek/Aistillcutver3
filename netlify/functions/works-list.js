// netlify/functions/works-list.js
const { Client } = require("@notionhq/client");

exports.handler = async (event) => {
  try {
    const notion = new Client({ auth: process.env.NOTION_KEY });
    const dbId = process.env.NOTION_WORK_DB; // 🔑 WORKS용 DB ID

    const response = await notion.databases.query({
      database_id: dbId,
      sorts: [
        { property: "Year", direction: "descending" } // 연도 기준 정렬 (없으면 무시됨)
      ],
    });

    const items = response.results.map((page) => {
      const props = page.properties;

      const title =
        props.Title?.title?.[0]?.plain_text ||
        props.Name?.title?.[0]?.plain_text ||
        "Untitled";

      const client =
        props.Client?.rich_text?.[0]?.plain_text || "";

      const type =
        props.Type?.select?.name ||
        props.Type?.rich_text?.[0]?.plain_text ||
        "";

      const year = props.Year?.number || null;

      const url =
        props.URL?.url ||
        props.Link?.url ||
        null;

      // 썸네일 파일이 있으면 URL 추출
      let thumb = null;
      if (props.Thumbnail?.files?.length) {
        const file = props.Thumbnail.files[0];
        thumb = file.external?.url || file.file?.url || null;
      }

      return { title, client, type, year, url, thumb };
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, items }),
    };
  } catch (err) {
    console.error("works-list error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message }),
    };
  }
};
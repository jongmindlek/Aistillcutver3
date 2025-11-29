// netlify/functions/works-list.js
const { Client } = require("@notionhq/client");

exports.handler = async () => {
  try {
    const NOTION_KEY = process.env.NOTION_KEY;
    const WORK_DB = process.env.NOTION_WORK_DB;

    if (!NOTION_KEY || !WORK_DB) {
      console.error("ENV MISSING", { NOTION_KEY: !!NOTION_KEY, WORK_DB: !!WORK_DB });
      return {
        statusCode: 500,
        body: JSON.stringify({
          ok: false,
          error: "환경변수 NOTION_KEY / NOTION_WORK_DB 를 확인해 주세요.",
        }),
      };
    }

    const notion = new Client({ auth: NOTION_KEY });

    // DB에서 페이지 불러오기 (최대 30개 정도)
    const response = await notion.databases.query({
      database_id: WORK_DB,
      page_size: 30,
      sorts: [
        // Year 숫자 컬럼이 있다면 연도 내림차순
        { property: "Year", direction: "descending" },
      ],
    });

    const items = response.results.map((page) => {
      const props = page.properties || {};

      // 1) 제목 : Title, Name 등 title 속성 우선 사용
      let title = "Untitled";
      if (props.Title && props.Title.title?.length) {
        title = props.Title.title[0].plain_text;
      } else if (props.Name && props.Name.title?.length) {
        title = props.Name.title[0].plain_text;
      }

      // 2) 클라이언트 : Client (rich_text)
      const client =
        props.Client?.rich_text?.[0]?.plain_text || "";

      // 3) 타입 : Type (select or rich_text)
      let type = "";
      if (props.Type?.select?.name) {
        type = props.Type.select.name;
      } else if (props.Type?.rich_text?.[0]?.plain_text) {
        type = props.Type.rich_text[0].plain_text;
      }

      // 4) 연도 : Year (number)
      const year = typeof props.Year?.number === "number"
        ? props.Year.number
        : null;

      // 5) 링크 : URL 또는 Link (url 타입)
      const url = props.URL?.url || props.Link?.url || null;

      // 6) 썸네일 : Thumbnail (files)
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
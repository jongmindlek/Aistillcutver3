const { Client } = require("@notionhq/client");

exports.handler = async () => {
  try {
    const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_KEY;

    const GEAR_DB =
      process.env.NOTION_GEAR_DB ||
      process.env.NOTION_GEAR_DB_ID;

    if (!NOTION_TOKEN || !GEAR_DB) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          ok: false,
          error:
            "NOTION_TOKEN 또는 NOTION_GEAR_DB / NOTION_GEAR_DB_ID 환경변수를 확인해 주세요.",
        }),
      };
    }

    const notion = new Client({ auth: NOTION_TOKEN });

    const response = await notion.databases.query({
      database_id: GEAR_DB,
      page_size: 100,
      filter: {
        or: [
          {
            property: "IsActive",
            checkbox: { equals: true },
          },
          {
            property: "IsActive",
            checkbox: { is_empty: true },
          },
        ],
      },
      sorts: [
        { property: "Category", direction: "ascending" },
        { property: "Name", direction: "ascending" },
      ],
    });

    const items = response.results.map((page) => {
      const p = page.properties || {};

      const name = p.Name?.title?.[0]?.plain_text || "Untitled Gear";
      const category = p.Category?.select?.name || "기타";
      const dayPrice =
        typeof p.DayPrice?.number === "number" ? p.DayPrice.number : 0;
      const description =
        p.Description?.rich_text?.[0]?.plain_text || "";

      let photoUrl = "";
      const photoProp = p.Photo;
      if (photoProp) {
        if (photoProp.url) {
          photoUrl = photoProp.url;
        }
        if (!photoUrl && Array.isArray(photoProp.files) && photoProp.files.length) {
          const file = photoProp.files[0];
          if (file.external?.url) photoUrl = file.external.url;
          else if (file.file?.url) photoUrl = file.file.url;
        }
      }

      return {
        id: page.id,
        name,
        category,
        dayPrice,
        description,
        photoUrl,
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, items }),
    };
  } catch (err) {
    console.error("gear-list error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: err.message || "알 수 없는 오류",
      }),
    };
  }
};
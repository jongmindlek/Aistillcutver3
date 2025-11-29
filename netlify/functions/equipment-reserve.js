// netlify/functions/equipment-reserve.js
const { Client } = require("@notionhq/client");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_KEY;
    const GEAR_DB =
      process.env.NOTION_GEAR_DB ||
      process.env.NOTION_DB_GEAR ||
      process.env.GEAR_DB_ID;

    if (!NOTION_TOKEN || !GEAR_DB) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          ok: false,
          error:
            "환경변수 NOTION_TOKEN(or NOTION_KEY) / NOTION_GEAR_DB 를 확인해 주세요.",
        }),
      };
    }

    const notion = new Client({ auth: NOTION_TOKEN });
    const data = JSON.parse(event.body || "{}");

    const {
      Title,
      ProjectName,
      RenterName,
      Contact,
      Gear, // 장바구니 내역 전체 문자열
      Date, // 대표 날짜
      Memo,
    } = data;

    const properties = {
      Title: {
        title: [{ text: { content: Title || "Gear Reservation" } }],
      },
      ProjectName: ProjectName
        ? { rich_text: [{ text: { content: ProjectName } }] }
        : undefined,
      RenterName: RenterName
        ? { rich_text: [{ text: { content: RenterName } }] }
        : undefined,
      Contact: Contact
        ? { rich_text: [{ text: { content: Contact } }] }
        : undefined,
      Gear: Gear
        ? { rich_text: [{ text: { content: Gear } }] }
        : undefined,
      Date: Date
        ? { date: { start: Date } }
        : undefined,
      Memo: Memo
        ? { rich_text: [{ text: { content: Memo } }] }
        : undefined,
      AutoCreated: { checkbox: true },
    };

    Object.keys(properties).forEach((k) => {
      if (properties[k] === undefined) delete properties[k];
    });

    await notion.pages.create({
      parent: { database_id: GEAR_DB },
      properties,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error("equipment-reserve error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: err.message || "알 수 없는 오류",
      }),
    };
  }
};
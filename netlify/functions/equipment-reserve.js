// netlify/functions/equipment-reserve.js

const { Client } = require("@notionhq/client");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ ok: false, error: "Method Not Allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { name, phone, date, time, package: pkg, message } = body;

    const notion = new Client({ auth: process.env.NOTION_KEY });

    await notion.pages.create({
      parent: { database_id: process.env.NOTION_EQUIP_DB },
      properties: {
        이름: { title: [{ text: { content: name || "" } }] },
        연락처: { rich_text: [{ text: { content: phone || "" } }] },
        촬영날짜: date ? { date: { start: date } } : undefined,
        시간대: { rich_text: [{ text: { content: time || "" } }] },
        장비패키지: { rich_text: [{ text: { content: pkg || "" } }] },
        요청사항: { rich_text: [{ text: { content: message || "" } }] },
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (error) {
    console.error("equipment-reserve error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: error.message }),
    };
  }
};
// netlify/functions/ai-stillcut-request.js

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
    const { client, contact, projectType, refUrl, styleDesc, due } = body;

    const notion = new Client({ auth: process.env.NOTION_KEY });

    await notion.pages.create({
      parent: { database_id: process.env.NOTION_AI_DB },
      properties: {
        클라이언트명: { title: [{ text: { content: client || "" } }] },
        연락처: { rich_text: [{ text: { content: contact || "" } }] },
        프로젝트유형: {
          rich_text: [{ text: { content: projectType || "" } }],
        },
        참고링크: { rich_text: [{ text: { content: refUrl || "" } }] },
        스타일설명: {
          rich_text: [{ text: { content: styleDesc || "" } }],
        },
        마감일: due ? { date: { start: due } } : undefined,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (error) {
    console.error("ai-stillcut-request error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: error.message }),
    };
  }
};
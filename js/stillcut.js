// netlify/functions/notion-stillcut.js
import { Client } from "@notionhq/client";

export const handler = async (event) => {
  try {
    // 1. POST 데이터 파싱
    const body = JSON.parse(event.body);

    // 2. 필요한 값 체크 (필수값 없으면 오류)
    const required = [
      "projectTitle",
      "email",
      "phone",
      "videoType",
      "runtime",
      "budget",
      "shootDate",
      "location",
      "referenceLink",
      "images",
      "message"
    ];

    for (const key of required) {
      if (!body[key]) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: `Missing field: ${key}` })
        };
      }
    }

    // 3. Notion 설정
    const notion = new Client({ auth: process.env.NOTION_API_KEY });
    const databaseId = process.env.NOTION_STILLCUT_DB;

    if (!databaseId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "NOTION_STILLCUT_DB is missing" })
      };
    }

    // 4. Notion DB에 페이지 생성
    const response = await notion.pages.create({
      parent: { database_id: databaseId },

      properties: {
        Title: {
          title: [{ text: { content: body.projectTitle } }]
        },

        Email: {
          email: body.email
        },

        Phone: {
          phone_number: body.phone
        },

        VideoType: {
          select: { name: body.videoType }
        },

        Runtime: {
          select: { name: body.runtime }
        },

        Budget: {
          select: { name: body.budget }
        },

        ShootDate: {
          date: { start: body.shootDate }
        },

        Location: {
          rich_text: [{ text: { content: body.location } }]
        },

        ReferenceLink: {
          url: body.referenceLink
        },

        Images: {
          rich_text: [
            { text: { content: body.images.join(", ") } }
          ]
        },

        Message: {
          rich_text: [{ text: { content: body.message } }]
        },

        Status: {
          select: { name: "신규 요청" }
        }
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Stillcut reservation saved!",
        notionId: response.id
      }),
    };

  } catch (error) {
    console.error("Stillcut Error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Notion stillcut error",
        details: error.message
      })
    };
  }
};
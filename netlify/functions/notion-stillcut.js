// netlify/functions/notion-stillcut.js
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_API_KEY });

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ ok: false, message: "Method Not Allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    const {
      projectTitle,
      email,
      phone,
      videoType,
      runtime,
      budget,
      shootDate,
      location,
      referenceLink,
      images = [],
      message,
    } = body;

    // Notion에 보낼 properties (컬럼 이름 **정확히 이렇게** 맞춰줘야 함)
    // Title (title)
    // Phone (phone_number)
    // Email (email)
    // ProjectTitle (rich_text)
    // Video Type (select)
    // Runtime (select)
    // Budget (select)
    // Shoot Date (date)
    // Location (rich_text)
    // Reference Link (url)
    // Images (rich_text)
    // Message (rich_text)
    // Status (select)
    const properties = {
      Title: {
        title: [
          {
            text: { content: projectTitle || "제목 없음" },
          },
        ],
      },
      Phone: {
        phone_number: phone || "",
      },
      Email: {
        email: email || "",
      },
      ProjectTitle: {
        rich_text: [
          {
            text: { content: projectTitle || "" },
          },
        ],
      },
      // select 타입들은 값이 있을 때만 설정 (Notion 옵션 이름과 같아야 함)
      "Video Type": videoType
        ? {
            select: { name: videoType },
          }
        : undefined,
      Runtime: runtime
        ? {
            select: { name: runtime },
          }
        : undefined,
      Budget: budget
        ? {
            select: { name: budget },
          }
        : undefined,
      "Shoot Date": shootDate
        ? {
            date: { start: shootDate },
          }
        : undefined,
      Location: location
        ? {
            rich_text: [{ text: { content: location } }],
          }
        : undefined,
      "Reference Link": referenceLink
        ? {
            url: referenceLink,
          }
        : undefined,
      Images: images && images.length
        ? {
            rich_text: [
              {
                text: {
                  content: images.join("\n"),
                },
              },
            ],
          }
        : undefined,
      Message: message
        ? {
            rich_text: [{ text: { content: message } }],
          }
        : undefined,
      Status: {
        select: { name: "신규" }, // Notion 옵션에 "신규" 추가해 두면 좋음
      },
    };

    // 값이 undefined 인 컬럼은 제거 (JSON.stringify 에선 빠지지만 안전하게 한 번 더)
    Object.keys(properties).forEach((key) => {
      if (properties[key] === undefined) {
        delete properties[key];
      }
    });

    await notion.pages.create({
      parent: { database_id: process.env.NOTION_STILLCUT_DB_ID },
      properties,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (error) {
    console.error("Notion stillcut error", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        message: error.message || "Unknown Notion error",
      }),
    };
  }
};
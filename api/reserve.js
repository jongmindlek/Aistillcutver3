import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { name, phone, date, time, message } = req.body;

    await notion.pages.create({
      parent: { database_id: process.env.NOTION_DB },
      properties: {
        이름: { title: [{ text: { content: name } }] },
        연락처: { rich_text: [{ text: { content: phone } }] },
        날짜: { date: { start: date } },
        시간: { rich_text: [{ text: { content: time } }] },
        요청사항: { rich_text: [{ text: { content: message } }] },
      },
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Notion Error:", err);
    return res.status(500).json({ error: "Notion API Error" });
  }
}
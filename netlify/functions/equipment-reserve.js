const { Client } = require("@notionhq/client");

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const notion = new Client({ auth: process.env.NOTION_KEY });

    await notion.pages.create({
      parent: { database_id: process.env.NOTION_GEAR_DB },

      properties: {
        Title: { title: [{ text: { content: body.Title || "Gear Reservation" } }] },
        Gear: { rich_text: [{ text: { content: body.Gear || "" } }] },
        RenterName: { rich_text: [{ text: { content: body.RenterName || "" } }] },
        ProjectName: { rich_text: [{ text: { content: body.ProjectName || "" } }] },
        Contact: { rich_text: [{ text: { content: body.Contact || "" } }] },
        Memo: { rich_text: [{ text: { content: body.Memo || "" } }] },

        Date: body.Date
          ? { date: { start: body.Date } }
          : undefined,

        AutoCreated: { checkbox: true }
      }
    });

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
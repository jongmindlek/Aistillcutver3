const { Client } = require("@notionhq/client");

exports.handler = async (event) => {
  try{
    if(event.httpMethod !== "POST"){
      return { statusCode:405, body:JSON.stringify({error:"Method Not Allowed"}) };
    }

    const body = JSON.parse(event.body || "{}");

    const notion = new Client({ auth: process.env.NOTION_TOKEN });
    const dbId = process.env.NOTION_STILLCUT_DB_ID;

    const imagesMetaText = (body.imagesMeta || [])
      .map(f => `${f.name} (${Math.round(f.size/1024)}KB)`)
      .join("\n");

    const page = await notion.pages.create({
      parent: { database_id: dbId },
      properties: {
        "Title": { title: [{ text: { content: body.projectTitle || "Untitled" } }] },
        "Phone": { phone_number: body.phone || "" },
        "Email": { email: body.email || "" },
        "Video Type": { select: body.videoType ? { name: body.videoType } : null },
        "Runtime": { rich_text: [{ text: { content: body.runtime || "" } }] },
        "Budget": { select: body.budget ? { name: body.budget } : null },
        "Shoot Date": body.shootDate ? { date: { start: body.shootDate } } : null,
        "Location": { rich_text: [{ text: { content: body.location || "" } }] },
        "Reference Link": body.referenceLink ? { url: body.referenceLink } : null,
        "Images": { rich_text: [{ text: { content: imagesMetaText || "" } }] },
        "Message": { rich_text: [{ text: { content: body.message || "" } }] },
        "Status": { select: { name: "New" } }
      }
    });

    return {
      statusCode:200,
      body:JSON.stringify({ ok:true, id: page.id })
    };

  }catch(err){
    console.error(err);
    return {
      statusCode:500,
      body:JSON.stringify({ error: err.message || "Notion stillcut error" })
    };
  }
};
// netlify/functions/notion-stillcut.js
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const STILLCUT_DB_ID = process.env.NOTION_STILLCUT_DB_ID;

// Notion Stillcut DB property names (스크린샷 기준)
const P = {
  TITLE: "Title",            // title (자동)
  PHONE: "Phone",            // phone_number
  EMAIL: "Email",            // email
  PROJECT: "ProjectTitle",   // rich_text
  VIDEO_TYPE: "Video Type",  // select
  RUNTIME: "Runtime",        // number
  BUDGET: "Budget",          // select
  SHOOT_DATE: "Shoot Date",  // date
  LOCATION: "Location",      // rich_text
  REF_LINK: "Reference Link",// url
  IMAGES: "Images",          // rich_text(메타 저장)
  MESSAGE: "Message",        // rich_text
  STATUS: "Status"           // select (optional)
};

exports.handler = async (event) => {
  if(event.httpMethod !== "POST"){
    return { statusCode:405, body:"Method Not Allowed" };
  }

  try{
    const body = JSON.parse(event.body || "{}");

    const titleText = body.projectTitle || "AI Stillcut Reservation";

    const imagesMetaText = (body.imagesMeta||[])
      .map(f=>`${f.name} (${Math.round(f.size/1024)}KB)`)
      .join(", ");

    const page = await notion.pages.create({
      parent: { database_id: STILLCUT_DB_ID },
      properties: {
        [P.TITLE]: { title: [{ text: { content: titleText } }] },
        [P.PHONE]: { phone_number: body.phone || "" },
        [P.EMAIL]: { email: body.email || "" },
        [P.PROJECT]: { rich_text: [{ text: { content: body.projectTitle || "" } }] },
        [P.VIDEO_TYPE]: body.videoType ? { select: { name: body.videoType } } : undefined,
        [P.RUNTIME]: typeof body.runtime === "number" ? { number: body.runtime } : undefined,
        [P.BUDGET]: body.budget ? { select: { name: body.budget } } : undefined,
        [P.SHOOT_DATE]: body.shootDate ? { date: { start: body.shootDate } } : undefined,
        [P.LOCATION]: { rich_text: [{ text: { content: body.location || "" } }] },
        [P.REF_LINK]: body.referenceLink ? { url: body.referenceLink } : undefined,
        [P.IMAGES]: { rich_text: [{ text: { content: imagesMetaText } }] },
        [P.MESSAGE]: { rich_text: [{ text: { content: body.message || "" } }] },
        [P.STATUS]: { select: { name: "Waiting" } }
      }
    });

    return {
      statusCode: 200,
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ ok:true, id: page.id })
    };

  }catch(e){
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message:"Notion stillcut error",
        details:e.message
      })
    };
  }
};
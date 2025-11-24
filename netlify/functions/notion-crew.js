// netlify/functions/notion-crew.js
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const CREW_DB_ID = process.env.NOTION_CREW_DB_ID;

// Notion Crew DB property names (스크린샷 기준)
const P = {
  NAME: "Name",          // title
  MAIN_ROLE: "MainRole", // select (director / staff)
  ROLES: "Roles",        // multi_select
  SKILLS: "Skills",      // multi_select
  BIO: "Bio",            // rich_text
  INSTAGRAM: "Instagram",// url
  PHONE: "Phone",        // phone_number
  EMAIL: "Email",        // email
  PROFILE: "ProfileImage", // files
  SORT: "Sort"           // number
};

function getTitle(prop){
  if(!prop?.title?.length) return "";
  return prop.title.map(t=>t.plain_text).join("");
}
function getText(prop){
  if(!prop?.rich_text?.length) return "";
  return prop.rich_text.map(t=>t.plain_text).join("");
}
function getSelect(prop){ return prop?.select?.name || ""; }
function getMulti(prop){ return (prop?.multi_select||[]).map(x=>x.name); }
function getFileUrl(prop){
  const f = prop?.files?.[0];
  if(!f) return "";
  return f.type === "file" ? f.file.url : f.external.url;
}

exports.handler = async () => {
  try{
    const r = await notion.databases.query({
      database_id: CREW_DB_ID,
      sorts: [{ property: P.SORT, direction: "ascending"}]
    });

    const people = r.results.map(page=>{
      const props = page.properties;
      return {
        name: getTitle(props[P.NAME]),
        mainRole: getSelect(props[P.MAIN_ROLE]),
        roles: getMulti(props[P.ROLES]),
        skills: getMulti(props[P.SKILLS]),
        bio: getText(props[P.BIO]),
        instagram: props[P.INSTAGRAM]?.url || "",
        phone: props[P.PHONE]?.phone_number || "",
        email: props[P.EMAIL]?.email || "",
        profileImage: getFileUrl(props[P.PROFILE]),
        sort: props[P.SORT]?.number ?? 999
      };
    });

    const directors = people.filter(p=> (p.mainRole||"").toLowerCase() === "director");
    const staff = people.filter(p=> (p.mainRole||"").toLowerCase() !== "director");

    return {
      statusCode: 200,
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ directors, staff })
    };

  }catch(e){
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Notion crew fetch error",
        details: e.message
      })
    };
  }
};
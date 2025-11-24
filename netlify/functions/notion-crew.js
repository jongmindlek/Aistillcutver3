const { Client } = require("@notionhq/client");

exports.handler = async () => {
  try{
    const notion = new Client({ auth: process.env.NOTION_TOKEN });
    const dbId = process.env.NOTION_CREW_DB_ID;

    const resp = await notion.databases.query({
      database_id: dbId,
      sorts: [{ property: "Sort", direction: "ascending" }]
    });

    const items = resp.results.map(p=>{
      const props = p.properties;

      const getTitle = (name)=> (props[name]?.title||[])[0]?.plain_text || "";
      const getRich = (name)=> (props[name]?.rich_text||[]).map(t=>t.plain_text).join(" ");
      const getSelect = (name)=> props[name]?.select?.name || "";
      const getMulti = (name)=> (props[name]?.multi_select||[]).map(s=>s.name);
      const getUrl = (name)=> props[name]?.url || "";
      const getEmail = (name)=> props[name]?.email || "";
      const getPhone = (name)=> props[name]?.phone_number || "";

      return {
        id: p.id,
        name: getTitle("Name"),
        mainRole: getSelect("MainRole"),   // "director" or "staff"
        roles: getMulti("Roles"),
        skills: getMulti("Skills"),
        bio: getRich("Bio"),
        instagram: getUrl("Instagram"),
        email: getEmail("Email"),
        phone: getPhone("Phone")
      };
    });

    return { statusCode:200, body:JSON.stringify({ items }) };

  }catch(err){
    console.error(err);
    return { statusCode:500, body:JSON.stringify({ error: err.message || "Notion crew fetch error" }) };
  }
};
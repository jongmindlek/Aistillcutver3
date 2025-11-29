// netlify/functions/equipment-reserve.js
const { Client } = require("@notionhq/client");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_KEY;
    const GEAR_DB = process.env.NOTION_GEAR_DB;

    if (!NOTION_TOKEN || !GEAR_DB) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          ok: false,
          error:
            "환경변수 NOTION_TOKEN / NOTION_GEAR_DB 를 확인해 주세요.",
        }),
      };
    }

    const notion = new Client({ auth: NOTION_TOKEN });
    const data = JSON.parse(event.body || "{}");

    const {
      RenterName,
      Contact,
      ProjectName,
      Memo,
      DiscountTypeLabel,
      CartMemo,
      Reservations, // [{ gearName, start, end, days, totalPrice }, ...]
    } = data;

    if (!Array.isArray(Reservations) || !Reservations.length) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: "예약 항목이 없습니다." }),
      };
    }

    const discountText = DiscountTypeLabel || "할인 없음";

    for (const item of Reservations) {
      const properties = {
        Title: {
          title: [
            {
              text: {
                content:
                  "Gear Reservation - " +
                  (item.gearName || "Unknown Gear"),
              },
            },
          ],
        },
        GearName: item.gearName
          ? { rich_text: [{ text: { content: item.gearName } }] }
          : undefined,
        StartDate: item.start
          ? { date: { start: item.start } }
          : undefined,
        EndDate: item.end
          ? { date: { start: item.start, end: item.end } }
          : undefined,
        RenterName: RenterName
          ? { rich_text: [{ text: { content: RenterName } }] }
          : undefined,
        Contact: Contact
          ? { rich_text: [{ text: { content: Contact } }] }
          : undefined,
        ProjectName: ProjectName
          ? { rich_text: [{ text: { content: ProjectName } }] }
          : undefined,
        Memo: Memo
          ? { rich_text: [{ text: { content: Memo } }] }
          : undefined,
        Discount: {
          rich_text: [
            {
              text: {
                content:
                  discountText +
                  (CartMemo ? " / " + CartMemo : ""),
              },
            },
          ],
        },
      };

      Object.keys(properties).forEach((k) => {
        if (properties[k] === undefined) delete properties[k];
      });

      await notion.pages.create({
        parent: { database_id: GEAR_DB },
        properties,
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error("equipment-reserve error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: err.message || "알 수 없는 오류",
      }),
    };
  }
};
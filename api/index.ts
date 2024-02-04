import type { VercelRequest, VercelResponse } from "@vercel/node";
import Knex from "knex";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (!request.url) return response.status(400);

  const url = new URL(request.url, `http://${request.headers.host}`);
  const { searchParams } = url;
  const idToExclude = searchParams.get("exclude");

  const knex = Knex({
    client: "pg",
    connection: {
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      ssl: { rejectUnauthorized: false },
    },
  });

  let query = knex("lang_cards.LanguageCard")
    .select("id", "englishTranslations", "dutch")
    .orderByRaw("RANDOM()")
    .limit(1);

  if (idToExclude) {
    query = query.whereNot("id", idToExclude);
  }

  const result = await query;

  await knex.destroy();

  if (result.length === 0) {
    return response.status(404);
  }

  const row = result[0];

  return response.status(200).json({
    id: row.id,
    englishTranslations: row.englishTranslations,
    dutch: row.dutch,
  });
}

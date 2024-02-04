import type { VercelRequest, VercelResponse } from "@vercel/node";
import Knex from "knex";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
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

  const result = await knex("lang_cards.LanguageCard")
    .select("id", "englishTranslations", "dutch")
    .orderByRaw("RANDOM()")
    .limit(1);

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

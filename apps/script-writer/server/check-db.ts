import { db, loglineIdeas } from "./src/db";
import { sql } from "drizzle-orm";

async function checkTable() {
  try {
    const result = await db.execute(sql`SELECT count(*) FROM logline_ideas`);
    console.log("Table logline_ideas exists. Count:", result[0]);
  } catch (e) {
    console.error("Table logline_ideas DOES NOT EXIST or error:", e.message);
  }
  process.exit(0);
}

checkTable();

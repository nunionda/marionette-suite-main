import { db, loglineIdeas } from "./src/db";

async function testDB() {
  try {
    console.log("Attempting to insert test logline...");
    const [inserted] = await db.insert(loglineIdeas).values({
      content: "TEST LOGLINE CONTENT",
      category: "TEST CAT",
      genre: "TEST GENRE"
    }).returning();
    console.log("Successfully inserted:", inserted);

    const all = await db.select().from(loglineIdeas);
    console.log("All loglines count:", all.length);
  } catch (e) {
    console.error("DB TEST FAILED:", e.message);
  }
  process.exit(0);
}

testDB();

import { db, projects } from "./db";
import { syncProjectToFileSystem } from "./lib/sync";

async function runInitialSync() {
  console.log("🚀 Starting initial File System synchronization...");
  const allProjects = await db.select().from(projects);
  
  for (const project of allProjects) {
    await syncProjectToFileSystem(project);
  }
  
  console.log("✅ Initial synchronization complete.");
  process.exit(0);
}

runInitialSync().catch((err) => {
  console.error("❌ Initial sync failed:", err);
  process.exit(1);
});

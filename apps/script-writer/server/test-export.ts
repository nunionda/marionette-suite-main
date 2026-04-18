import { db, projects } from "./src/db";
import { like } from "drizzle-orm";

async function run() {
  const allProjects = await db.select().from(projects).where(like(projects.title, '%나이키%'));
  if (allProjects.length === 0) {
    console.log("Not found");
    process.exit(1);
  }
  const id = allProjects[0].id;
  console.log("Found project ID:", id);

  const res = await fetch(`${(process.env.INTERNAL_CONTENTS_STUDIO_API_URL ?? "http://localhost:3005")}/api/projects/${id}/export`, { method: "POST" });
  const data = await res.json();
  console.log("Export started:", data);
  
  const jobId = data.jobId;
  const poll = setInterval(async () => {
    const res2 = await fetch(`${(process.env.INTERNAL_CONTENTS_STUDIO_API_URL ?? "http://localhost:3005")}/api/export/${jobId}`);
    const data2 = await res2.json();
    console.log("Status:", data2.job.status);
    if (data2.job.status === "completed" || data2.job.status === "failed") {
      clearInterval(poll);
      console.log("Done:", data2);
      process.exit(0);
    }
  }, 3000);
}
run();

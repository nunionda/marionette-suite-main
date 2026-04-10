import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkResults() {
  const projectId = "cmnswh1zt0001azm5k725253g";
  const runId = "cmnswhzf90001azbp5dyv78f6";

  console.log(`🔍 Checking results for Project ${projectId}...`);

  const run = await prisma.pipelineRun.findUnique({
    where: { id: runId }
  });

  if (!run) {
    console.log("❌ Pipeline run not found.");
    return;
  }

  console.log(`Status: ${run.status}`);
  console.log(`Progress: ${run.progress}%`);
  
  if (run.stepResults && Object.keys(run.stepResults).length > 0) {
    console.log("✅ Step Results found!");
    console.log(JSON.stringify(run.stepResults, null, 2));
  } else {
    console.log("⏳ No results yet. Agent might still be running.");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (project?.logline) {
    console.log(`✅ Final Project Logline: ${project.logline}`);
  }
}

checkResults()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

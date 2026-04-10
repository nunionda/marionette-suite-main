import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function kickoffNike() {
  console.log("🚀 Kickoff Nike Project...");

  // 1. Find Admin User
  const user = await prisma.user.findUnique({
    where: { email: "admin@marionette.com" }
  });

  if (!user) {
    throw new Error("Admin user not found. Please initialize first.");
  }

  // 2. Create Nike Project
  const project = await prisma.project.create({
    data: {
      title: "Nike // Just Do It 2026",
      genre: "COMMERCIAL",
      idea: "A 30-second futuristic commercial celebrating human potential and AI-enhanced sports performance in 2026.",
      status: "DRAFT",
      userId: user.id
    }
  });

  console.log(`✅ Project Created: ${project.id} (${project.title})`);
  
  // 3. (Optional) Trigger API to start Pipeline
  // For now, we seed the project so the Studio Hub can see it.
}

kickoffNike()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

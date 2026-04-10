// ---------------------------------------------------------------------------
// Marionette Agent CLI — Bridge for Python-to-TS communication
// Usage: bun run src/cli.ts <agent_name> '<json_input>'
// ---------------------------------------------------------------------------

import { PrismaClient } from "@marionette/db"
import { AIGateway } from "@marionette/ai-gateway"
import { createAgentRegistry } from "./index.js"
import { env } from "node:process"

async function main() {
  const args = process.argv.slice(2)
  if (args.length < 2) {
    console.error("Usage: bun run src/cli.ts <agent_name> '<json_input>'")
    process.exit(1)
  }

  const agentName = args[0]!
  let inputData: any
  
  try {
    inputData = JSON.parse(args[1]!)
  } catch (err) {
    console.error("Invalid JSON input")
    process.exit(1)
  }

  // 1. Initialize dependencies
  // Note: Using Marionette DB package for Prisma consistency
  const db = new PrismaClient()
  const gateway = new AIGateway({
    geminiKey: env.GEMINI_API_KEY || "",
    replicateKey: env.REPLICATE_API_KEY || "",
  })

  // 2. Resolve agent
  const registry = createAgentRegistry(gateway, db)
  const agent = registry.get(agentName)

  if (!agent) {
    console.error(`Agent "${agentName}" not found in registry.`)
    process.exit(1)
  }

  // 3. Execute
  console.log(`[CLI] Executing Agent: ${agent.name} (Phase: ${agent.phase})`)
  try {
    const output = await agent.execute(inputData)
    
    // 4. Output structured result
    console.log("--- RESULT START ---")
    console.log(JSON.stringify(output, null, 2))
    console.log("--- RESULT END ---")
    
    process.exit(output.success ? 0 : 1)
  } catch (err) {
    console.error(`Execution failed: ${err instanceof Error ? err.message : String(err)}`)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { investorsRoutes } from "./routes/investors.js";
import { projectsRoutes } from "./routes/projects.js";
import { spcRoutes } from "./routes/spc.js";
import { irRoutes } from "./routes/ir.js";

const PORT = Number(process.env.FINANCE_API_PORT ?? 4010);

const app = new Elysia()
  .use(cors())
  .get("/", () => ({
    service: "Marionette Film Finance API",
    version: "1.0.0",
    description: "Korean film PF/SPC financing, investor DB, waterfall model, IR reporting",
    endpoints: {
      investors: "GET|POST /investors  —  한국 영화 투자자 DB",
      projects:  "GET|POST /projects   —  영화 프로젝트",
      spc:       "GET|POST /spc        —  SPC 구조 / PF 트란쉐 / 워터폴",
      ir:        "GET      /ir/:id     —  IR 리포트 + 시나리오 분석",
    },
  }))
  .use(investorsRoutes)
  .use(projectsRoutes)
  .use(spcRoutes)
  .use(irRoutes)
  .listen(PORT);

console.log(`🎬 Finance API running at http://localhost:${PORT}`);

export type App = typeof app;

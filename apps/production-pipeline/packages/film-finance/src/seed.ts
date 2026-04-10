/**
 * Seed: Korean film investor sample data + Bit-Savior SPC structure
 * Run: bun run src/seed.ts
 */
import { getFinanceDb } from "./repositories/db.js";
import { InvestorRepository } from "./repositories/investors.js";
import { FilmProjectRepository } from "./repositories/projects.js";
import { SPCRepository } from "./repositories/spc.js";
import { buildStandardKoreanPFWaterfall } from "./simulators/waterfall.js";
import { InvestorType, InvestorTier, TrancheType } from "./generated/client/index.js";

const db = getFinanceDb();
const investors = new InvestorRepository(db);
const projects = new FilmProjectRepository(db);
const spcs = new SPCRepository(db);

async function seed() {
  console.log("🌱 Seeding Korean film finance data...");

  // ── 1. Investors ──────────────────────────────────────────────────────────
  const inv1 = await investors.create({
    name: "한국문화투자",
    nameEn: "Korea Culture Investment",
    type: InvestorType.기관투자자,
    tier: InvestorTier.A,
    region: "서울",
    contactName: "박문화",
    contactEmail: "invest@kcultureinvest.co.kr",
    investmentCapacity: 200000,  // 200억
    minTicket: 10000,            // 10억
    maxTicket: 50000,            // 50억
    preferredGenres: ["드라마", "스릴러", "SF"],
    preferredBudgetRange: { min: 30000, max: 200000 },
    pastInvestments: [
      { title: "기생충", year: 2019, amount: 30000, role: "공동제작" },
      { title: "범죄도시4", year: 2024, amount: 20000, role: "선순위" },
    ],
    notes: "영진위 공인 영화투자조합 운용사. ESG 영화 우대 조건 보유.",
  });

  const inv2 = await investors.create({
    name: "CJ ENM 투자부문",
    nameEn: "CJ ENM Investment",
    type: InvestorType.배급사,
    tier: InvestorTier.A,
    region: "서울",
    contactName: "이배급",
    contactEmail: "cj.invest@cjenm.com",
    investmentCapacity: 500000,  // 500억
    minTicket: 30000,
    maxTicket: 200000,
    preferredGenres: ["액션", "코미디", "스릴러", "SF"],
    preferredBudgetRange: { min: 50000, max: 500000 },
    pastInvestments: [
      { title: "어벤져스: 엔드게임 한국배급", year: 2019, amount: 0, role: "배급" },
      { title: "기생충", year: 2019, amount: 50000, role: "배급/투자" },
    ],
  });

  const inv3 = await investors.create({
    name: "영화진흥위원회 제작지원펀드",
    nameEn: "KOFIC Production Support Fund",
    type: InvestorType.공공기금,
    tier: InvestorTier.B,
    region: "부산",
    contactName: "김진흥",
    contactEmail: "fund@kofic.or.kr",
    investmentCapacity: 100000,
    minTicket: 3000,
    maxTicket: 20000,
    preferredGenres: ["독립영화", "예술영화", "다큐멘터리"],
    preferredBudgetRange: { min: 5000, max: 100000 },
    notes: "영진위 조성 영화제작지원펀드. 한국 독립/예술영화 우선 지원.",
  });

  const inv4 = await investors.create({
    name: "킬러콘텐츠벤처스",
    nameEn: "Killer Contents Ventures",
    type: InvestorType.VC,
    tier: InvestorTier.B,
    region: "서울",
    contactName: "최벤처",
    contactEmail: "deal@killercontents.vc",
    investmentCapacity: 50000,
    minTicket: 2000,
    maxTicket: 15000,
    preferredGenres: ["SF", "스릴러", "호러"],
    preferredBudgetRange: { min: 10000, max: 80000 },
    notes: "콘텐츠IP 전문 VC. 메자닌 구조 선호. 해외 세일즈 연계 가능.",
  });

  const inv5 = await investors.create({
    name: "이앤투자조합 3호",
    nameEn: "E&N Investment Fund 3",
    type: InvestorType.투자조합,
    tier: InvestorTier.B,
    region: "서울",
    contactName: "한이앤",
    contactEmail: "fn3@en-fund.co.kr",
    investmentCapacity: 30000,
    minTicket: 1000,
    maxTicket: 8000,
    preferredGenres: ["드라마", "로맨스", "범죄"],
    preferredBudgetRange: { min: 5000, max: 50000 },
  });

  const inv6 = await investors.create({
    name: "블루오션엔젤클럽",
    nameEn: "Blue Ocean Angel Club",
    type: InvestorType.개인천사투자자,
    tier: InvestorTier.C,
    region: "서울",
    contactName: "정천사",
    contactEmail: "angel@blueocean.kr",
    investmentCapacity: 5000,
    minTicket: 500,
    maxTicket: 2000,
    preferredGenres: ["SF", "액션"],
    notes: "개인 엔젤 클럽. 국내 테크 스릴러 장르 관심.",
  });

  console.log(`  ✅ Created ${6} investors`);

  // ── 2. Film Project ───────────────────────────────────────────────────────
  const project = await projects.create({
    title: "비트 세이버: 라스트 코드",
    titleEn: "Bit-Savior: The Last Code",
    genre: "금융 테크노 스릴러",
    logline:
      "북한 라자루스 해커단이 한국 금융망을 붕괴시키려는 48시간, 한 전직 화이트햇 해커의 최후 작전.",
    totalBudget: 80000, // 80억
    budgetBreakdown: {
      pre: 8000,
      main: 45000,
      post: 15000,
      marketing: 10000,
      contingency: 2000,
    },
    targetReleaseDate: "2027-05-01",
    notes: "마리오네트 스튜디오 1호 장편. AI 파이프라인 전체 적용.",
  });

  console.log(`  ✅ Created project: ${project.title}`);

  // ── 3. SPC ────────────────────────────────────────────────────────────────
  const spc = await spcs.create({
    projectId: project.id,
    name: "(주)비트세이버SPC",
    legalType: "주식회사" as any,
    totalCapital: 10000,   // 자본금 10억
    totalBudget: 80000,    // 총 80억
    notes: "비트세이버 PF를 위한 특수목적법인. 선순위/메자닌/지분 3단 구조.",
  });

  console.log(`  ✅ Created SPC: ${spc.name}`);

  // ── 4. PF Tranches ────────────────────────────────────────────────────────
  // Senior: 30억 @ 5.5% p.a., 24개월
  const seniorTranche = await spcs.createTranche({
    spcId: spc.id,
    name: "선순위 대출",
    type: TrancheType.senior,
    priority: 1,
    targetAmount: 30000,
    interestRate: 5.5,
    termMonths: 24,
    notes: "은행/기관 대출. 원금+이자 최우선 상환.",
  });

  // Mezzanine: 20억 @ 12% target, 30개월
  const mezzanineTranche = await spcs.createTranche({
    spcId: spc.id,
    name: "메자닌 투자",
    type: TrancheType.mezzanine,
    priority: 2,
    targetAmount: 20000,
    interestRate: 12.0,
    termMonths: 30,
    notes: "VC/투자조합. 우선수익 보장 후 잔여 지분 참여.",
  });

  // Equity: 30억 지분
  const equityTranche = await spcs.createTranche({
    spcId: spc.id,
    name: "지분 투자",
    type: TrancheType.equity,
    priority: 3,
    targetAmount: 30000,
    targetReturn: 25.0,
    notes: "배급사/제작사 지분. 선후순위 정산 후 잔여 배분.",
  });

  console.log("  ✅ Created 3 tranches (선순위/메자닌/지분)");

  // ── 5. Assign Investors to Tranches ──────────────────────────────────────
  // Senior: 한국문화투자 20억 + 이앤투자조합 10억
  await spcs.addInvestorToTranche(seniorTranche.id, inv1.id, 20000);
  await spcs.addInvestorToTranche(seniorTranche.id, inv5.id, 10000);

  // Mezzanine: 킬러콘텐츠벤처스 12억 + 이앤투자조합 8억
  await spcs.addInvestorToTranche(mezzanineTranche.id, inv4.id, 12000);
  await spcs.addInvestorToTranche(mezzanineTranche.id, inv5.id, 8000);

  // Equity: CJ ENM 20억 + 영진위 5억 + 블루오션엔젤 2억 + 나머지 제작사
  await spcs.addInvestorToTranche(equityTranche.id, inv2.id, 20000);
  await spcs.addInvestorToTranche(equityTranche.id, inv3.id, 5000);
  await spcs.addInvestorToTranche(equityTranche.id, inv6.id, 2000);

  console.log("  ✅ Assigned investors to tranches");

  // ── 6. Auto-generate Waterfall Tiers ─────────────────────────────────────
  const waterfallTierInputs = buildStandardKoreanPFWaterfall(spc.id, [
    { id: seniorTranche.id, name: seniorTranche.name, type: "senior", priority: 1 },
    { id: mezzanineTranche.id, name: mezzanineTranche.name, type: "mezzanine", priority: 2 },
    { id: equityTranche.id, name: equityTranche.name, type: "equity", priority: 3 },
  ]);

  for (const tier of waterfallTierInputs) {
    await spcs.createWaterfallTier(tier as any);
  }

  console.log(`  ✅ Created ${waterfallTierInputs.length} waterfall tiers`);

  // ── 7. Sample Revenue Event ───────────────────────────────────────────────
  await spcs.createRevenueEvent({
    spcId: spc.id,
    amount: 50000, // 50억 극장 수익
    source: "theatrical" as any,
    eventDate: "2027-08-15",
    notes: "개봉 3주차 국내 극장 수익 (1차 정산)",
  });

  console.log("  ✅ Created sample revenue event (50억 극장 수익)");

  console.log("\n🎬 Seed complete.");
  console.log(`   Project: ${project.title} (ID: ${project.id})`);
  console.log(`   SPC: ${spc.name} (ID: ${spc.id})`);

  await db.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

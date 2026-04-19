import { AiOpsClient } from "./ai-ops-client";
import { getAiOpsHistory, summarizeHistory } from "../../../lib/ai-ops/history";
import { getCinemaEngine } from "../../../lib/cinema/engine";

/**
 * AI Ops dashboard — provider health matrix + job history.
 *
 * Server Component seeds initial state. Client polls both endpoints for
 * live updates. Health is registry-cached for 30s so polling is cheap.
 */
export default async function AiOpsPage() {
  // Ensure the history subscriber is active before the first snapshot.
  getCinemaEngine();
  const initialLog = getAiOpsHistory();
  const initialJobs = summarizeHistory(initialLog);

  return <AiOpsClient initialJobs={initialJobs} />;
}

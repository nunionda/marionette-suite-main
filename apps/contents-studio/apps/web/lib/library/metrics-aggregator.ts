import type { LibraryEntry, ContentCategory } from "@marionette/types-content";

/**
 * Polymorphic roll-up: each category gets its own summary shape because
 * the metrics themselves differ. Aggregator is the reverse of MetricsWidget —
 * Widget renders one entry's metrics, Aggregator sums across entries.
 */

export interface CategoryRollup {
  category: ContentCategory;
  count: number;
  headline: { label: string; value: string; accent: string }[];
}

function sum(xs: (number | undefined)[]): number {
  return xs.reduce<number>((a, b) => a + (b ?? 0), 0);
}

function avg(xs: (number | undefined)[]): number {
  const ys = xs.filter((x): x is number => x != null);
  return ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : 0;
}

function fmtMoney(n: number): string {
  if (n >= 1_000_000_000) return `₩${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₩${(n / 1_000_000).toFixed(1)}M`;
  return `₩${n.toLocaleString("ko-KR")}`;
}

export function rollup(entries: LibraryEntry[]): CategoryRollup[] {
  const byCat = new Map<ContentCategory, LibraryEntry[]>();
  for (const e of entries) {
    const list = byCat.get(e.category) ?? [];
    list.push(e);
    byCat.set(e.category, list);
  }

  const out: CategoryRollup[] = [];

  for (const [category, list] of byCat) {
    if (category === "film") {
      const boxOffice = sum(list.map((e) => e.metrics.box_office));
      const adm = sum(list.map((e) => e.metrics.admissions));
      const fests = sum(list.map((e) => e.metrics.festival_selections?.length));
      out.push({
        category,
        count: list.length,
        headline: [
          { label: "총 박스오피스", value: fmtMoney(boxOffice), accent: "#d4af37" },
          { label: "총 관객수", value: adm.toLocaleString("ko-KR"), accent: "#f0f0f8" },
          { label: "페스티벌 초청", value: `${fests}회`, accent: "#d4af37" },
        ],
      });
    } else if (category === "drama") {
      const rating = avg(list.map((e) => e.metrics.rating));
      const rank = Math.min(...list.map((e) => e.metrics.ott_rank ?? 999));
      const comp = avg(list.map((e) => e.metrics.episode_completion_rate));
      out.push({
        category,
        count: list.length,
        headline: [
          { label: "평균 평점", value: `${rating.toFixed(1)}/10`, accent: "#60a5fa" },
          { label: "최고 OTT 순위", value: rank === 999 ? "—" : `#${rank}`, accent: "#60a5fa" },
          { label: "평균 완주율", value: `${(comp * 100).toFixed(0)}%`, accent: "#f0f0f8" },
        ],
      });
    } else if (category === "commercial") {
      const cpm = avg(list.map((e) => e.metrics.cpm));
      const ctr = avg(list.map((e) => e.metrics.ctr));
      const lift = avg(list.map((e) => e.metrics.brand_lift));
      out.push({
        category,
        count: list.length,
        headline: [
          { label: "평균 CPM", value: `₩${Math.round(cpm).toLocaleString()}`, accent: "#4ade80" },
          { label: "평균 CTR", value: `${(ctr * 100).toFixed(1)}%`, accent: "#4ade80" },
          { label: "브랜드 상승", value: `${(lift * 100).toFixed(1)}%`, accent: "#fbbf24" },
        ],
      });
    } else if (category === "youtube") {
      const views = sum(list.map((e) => e.metrics.views));
      const subs = sum(list.map((e) => e.metrics.subscribers_gained));
      const rpm = avg(list.map((e) => e.metrics.rpm));
      out.push({
        category,
        count: list.length,
        headline: [
          { label: "총 조회수", value: views.toLocaleString("ko-KR"), accent: "#f87171" },
          { label: "구독자 증가", value: `+${subs.toLocaleString("ko-KR")}`, accent: "#f87171" },
          { label: "평균 RPM", value: `$${rpm.toFixed(2)}`, accent: "#4ade80" },
        ],
      });
    }
  }

  // Stable order: film → drama → commercial → youtube
  const order: ContentCategory[] = ["film", "drama", "commercial", "youtube"];
  out.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
  return out;
}

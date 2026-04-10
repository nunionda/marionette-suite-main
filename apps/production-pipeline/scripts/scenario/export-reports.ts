#!/usr/bin/env bun
// ── Analysis Report Exporter ──
// Exports analysis results as HTML and PDF files in both EN and KO.
// Uses Playwright to render the Next.js dashboard and capture output.

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

// ── Configuration ──
const API_BASE = 'http://localhost:4005';
const WEB_BASE = 'http://localhost:4000';
const OUTPUT_DIR = '/Users/daniel/Desktop/scripts/scripts-analysis-result';
const WAIT_TIMEOUT_MS = 120_000; // 120s for KO translation
const CHART_SETTLE_MS = 3_000;   // wait for chart animations
const FALLBACK_WAIT_MS = 15_000; // fallback wait if __EXPORT_READY never fires

const LOCALES = ['en', 'ko'] as const;

// ── Helpers ──
function generateExportFileName(scriptId: string): string {
  // Legacy format: _analysis_ → _report_
  if (scriptId.includes('_analysis_')) {
    return scriptId.replace('_analysis_', '_report_');
  }
  // New format: insert _report_ before date stamp
  const match = scriptId.match(/^(.+?)_(\d{6}_v\d{3})$/);
  if (match) {
    return `${match[1]}_report_${match[2]}`;
  }
  return scriptId;
}

async function checkServer(url: string, label: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    return res.ok;
  } catch {
    console.error(`  ❌ ${label} 서버에 연결할 수 없습니다: ${url}`);
    return false;
  }
}

async function getLatestReportIds(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/reports?pageSize=100`);
  const data = await res.json() as any;
  const reports = data.data || [];

  // Group by scenario slug, pick latest by date+version
  // Supports both new format ({slug}_{YYMMDD}_v{NNN}) and legacy ({name}_analysis_{YYMMDD}_v{NNN})
  const nameMap = new Map<string, { scriptId: string; date: string; version: number }>();
  for (const r of reports) {
    const id: string = r.scriptId;
    // Try new format first, then legacy
    const match = id.match(/^(.+?)_(\d{6})_v(\d{3})$/) || id.match(/^(.+)_analysis_(\d{6})_v(\d{3})$/);
    if (!match) continue;
    const name = match[1].replace(/_analysis$/, ''); // normalize legacy
    const date = match[2];
    const version = parseInt(match[3], 10);
    const existing = nameMap.get(name);
    if (!existing || date > existing.date || (date === existing.date && version > existing.version)) {
      nameMap.set(name, { scriptId: id, date, version });
    }
  }

  // Return the 3 most recent scenarios
  const result: string[] = [...nameMap.values()]
    .sort((a, b) => b.date.localeCompare(a.date) || b.version - a.version)
    .slice(0, 3)
    .map(v => v.scriptId);

  return result;
}

// ── Main ──
async function main() {
  const SEP = '═'.repeat(60);
  console.log(`\n${SEP}`);
  console.log('  Analysis Report Exporter — HTML + PDF × EN/KO');
  console.log(SEP);

  // 1. Health checks
  const apiOk = await checkServer(`${API_BASE}/`, 'API');
  const webOk = await checkServer(`${WEB_BASE}/`, 'Web');
  if (!apiOk || !webOk) {
    console.error('\n  필요한 서버가 실행되지 않았습니다.');
    console.error('  API: cd apps/api && bun run src/index.ts');
    console.error('  Web: cd apps/web && bun run dev');
    process.exit(1);
  }
  console.log('  ✅ API 서버 (4005) + Web 서버 (4000) 확인');

  // 2. Get target report IDs (CLI args override auto-detection)
  const cliIds = process.argv.slice(2).filter(a => !a.startsWith('--'));
  const scriptIds = cliIds.length > 0 ? cliIds : await getLatestReportIds();
  if (scriptIds.length === 0) {
    console.error('\n  ❌ 대상 리포트를 찾을 수 없습니다.');
    process.exit(1);
  }
  console.log(`  ✅ 대상 리포트 ${scriptIds.length}개:`);
  for (const id of scriptIds) console.log(`     ${id}`);

  // 3. Ensure output directory
  mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`  ✅ 출력 폴더: ${OUTPUT_DIR}`);

  // 4. Launch browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const totalExports = scriptIds.length * LOCALES.length * 2; // 2 formats
  let completed = 0;

  try {
    for (const scriptId of scriptIds) {
      for (const locale of LOCALES) {
        completed++;
        const progress = `[${completed * 2 - 1}-${completed * 2}/${totalExports}]`;
        const baseName = `${generateExportFileName(scriptId)}_${locale}`;
        console.log(`\n  ⏳ ${progress} ${scriptId} (${locale.toUpperCase()})`);

        const page = await context.newPage();
        const url = `${WEB_BASE}/dashboard?reportId=${encodeURIComponent(scriptId)}&locale=${locale}&expandAll=true`;

        try {
          // Navigate and wait for the page to load
          await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });

          // Wait for export-ready signal, with fallback timeout
          try {
            await page.waitForFunction(
              '(window).__EXPORT_READY === true',
              { timeout: WAIT_TIMEOUT_MS }
            );
          } catch {
            console.log(`     ⚠️ __EXPORT_READY timeout, using fallback wait...`);
            await page.waitForTimeout(FALLBACK_WAIT_MS);
          }

          // Wait for chart animations to settle
          await page.waitForTimeout(CHART_SETTLE_MS);

          // ── Save HTML ──
          // Inline all stylesheets for a self-contained HTML file
          const htmlContent = await page.evaluate(() => {
            // Collect all stylesheet content
            const styles: string[] = [];
            for (const sheet of document.styleSheets) {
              try {
                const rules = Array.from(sheet.cssRules || []);
                styles.push(rules.map(r => r.cssText).join('\n'));
              } catch {
                // Cross-origin stylesheets can't be read — skip
              }
            }

            // Remove all <link rel="stylesheet"> tags
            const links = document.querySelectorAll('link[rel="stylesheet"]');
            links.forEach(l => l.remove());

            // Remove existing <style> tags (they're now inlined)
            const existingStyles = document.querySelectorAll('style');
            existingStyles.forEach(s => s.remove());

            // Add one combined <style> tag
            const styleEl = document.createElement('style');
            styleEl.textContent = styles.join('\n');
            document.head.appendChild(styleEl);

            // Remove no-print elements for clean export
            document.querySelectorAll('.no-print').forEach(el => el.remove());

            // Force all phases expanded
            document.querySelectorAll('.phase-body').forEach(el => {
              (el as HTMLElement).style.maxHeight = 'none';
              (el as HTMLElement).style.overflow = 'visible';
            });

            return '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
          });

          const htmlPath = `${OUTPUT_DIR}/${baseName}.html`;
          await Bun.write(htmlPath, htmlContent);
          console.log(`     ✅ HTML: ${baseName}.html`);

          // ── Save PDF ──
          // Open a fresh page for PDF (HTML export modified the DOM)
          const pdfPage = await context.newPage();
          await pdfPage.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
          try {
            await pdfPage.waitForFunction(
              '(window).__EXPORT_READY === true',
              { timeout: WAIT_TIMEOUT_MS }
            );
          } catch {
            await pdfPage.waitForTimeout(FALLBACK_WAIT_MS);
          }
          await pdfPage.waitForTimeout(CHART_SETTLE_MS);

          const pdfPath = `${OUTPUT_DIR}/${baseName}.pdf`;
          await pdfPage.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: { top: '12mm', right: '15mm', bottom: '12mm', left: '15mm' },
          });
          console.log(`     ✅ PDF: ${baseName}.pdf`);

          await pdfPage.close();
        } catch (err: any) {
          console.error(`     ❌ 오류: ${err.message?.slice(0, 200)}`);
        } finally {
          await page.close();
        }
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\n${SEP}`);
  console.log(`  완료: ${OUTPUT_DIR}`);
  console.log(SEP);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

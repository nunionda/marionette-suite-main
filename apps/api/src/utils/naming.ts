/**
 * Naming Convention Utility
 *
 * Script Import:  {name}_analysis_{YYMMDD}_v{NNN}
 * PDF Export:     {name}_investor_analysis_{YYMMDD}_v{NNN}.pdf
 *
 * Examples:
 *   "미궁.fountain"  → migung_analysis_260322_v001
 *   "The Matrix.txt" → thematrix_analysis_260322_v001
 */

/* ─── Korean → Revised Romanization ─── */
const CHO  = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'];
const JUNG = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i'];
const JONG = ['','k','k','k','n','n','n','t','l','l','l','l','l','l','l','l','m','p','p','t','t','ng','t','t','k','t','p','t'];

export function romanizeKorean(text: string): string {
  let result = '';
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const off = code - 0xAC00;
      result += CHO[Math.floor(off / 588)] + JUNG[Math.floor((off % 588) / 28)] + JONG[off % 28];
    } else {
      result += ch;
    }
  }
  return result;
}

export function hasKorean(text: string): boolean {
  return /[\uAC00-\uD7A3]/.test(text);
}

/**
 * Sanitize a filename into a clean base name for the naming convention.
 * - Strips file extension
 * - Romanizes Korean characters
 * - Removes special characters (keeps alphanumeric and spaces)
 * - Converts spaces to underscores
 * - Lowercases everything
 */
export function sanitizeBaseName(fileName: string): string {
  // Remove extension
  let name = fileName.replace(/\.[^.]+$/, '');

  // Romanize Korean if present
  if (hasKorean(name)) {
    name = romanizeKorean(name);
  }

  // Remove special characters, keep alphanumeric and spaces
  name = name.replace(/[^a-zA-Z0-9\s]/g, '');

  // Collapse whitespace → single underscore, trim, lowercase
  name = name.trim().replace(/\s+/g, '_').toLowerCase();

  // Fallback if empty
  if (!name) name = 'untitled';

  return name;
}

/**
 * Get today's date in YYMMDD format.
 */
export function getDateStamp(date?: Date): string {
  const d = date || new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

/**
 * Format version number as v001, v002, etc.
 */
export function formatVersion(version: number): string {
  return `v${String(version).padStart(3, '0')}`;
}

/**
 * Generate a scriptId following the naming convention.
 *
 * Pattern: {name}_analysis_{YYMMDD}_v{NNN}
 *
 * @param fileName - Original filename (e.g., "미궁.fountain")
 * @param version - Version number (default: 1)
 * @param date - Optional date override (default: today)
 * @returns scriptId (e.g., "migung_analysis_260322_v001")
 */
export function generateScriptId(
  fileName: string,
  version: number = 1,
  date?: Date,
): string {
  const baseName = sanitizeBaseName(fileName);
  const dateStamp = getDateStamp(date);
  const ver = formatVersion(version);
  return `${baseName}_analysis_${dateStamp}_${ver}`;
}

/**
 * Extract the base name from a scriptId.
 *
 * "migung_analysis_260322_v001" → "migung"
 */
export function extractBaseName(scriptId: string): string {
  const match = scriptId.match(/^(.+?)_analysis_/);
  return match ? match[1] : scriptId;
}

/**
 * Extract version number from a scriptId.
 *
 * "migung_analysis_260322_v001" → 1
 */
export function extractVersion(scriptId: string): number {
  const match = scriptId.match(/_v(\d{3})$/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Generate PDF export filename from a scriptId.
 *
 * Pattern: {name}_investor_analysis_{YYMMDD}_v{NNN}
 *
 * "migung_analysis_260322_v001" → "migung_investor_analysis_260322_v001"
 */
export function generateExportFileName(scriptId: string): string {
  return scriptId.replace('_analysis_', '_investor_analysis_');
}

/**
 * Build the search pattern for finding existing versions of the same script + date.
 *
 * Returns a prefix like "migung_analysis_260322_" for DB LIKE queries.
 */
export function getVersionSearchPattern(fileName: string, date?: Date): string {
  const baseName = sanitizeBaseName(fileName);
  const dateStamp = getDateStamp(date);
  return `${baseName}_analysis_${dateStamp}_`;
}

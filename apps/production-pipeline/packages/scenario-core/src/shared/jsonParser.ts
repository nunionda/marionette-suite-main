/**
 * Robust JSON parser for LLM responses.
 * Handles markdown fences, truncated JSON, and common Gemini quirks.
 */
export function cleanAndParseJSON<T = unknown>(raw: string, mode: 'object' | 'array' = 'object'): T {
  let content = raw.trim();

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  content = content.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/, '');

  // Extract the outermost JSON structure
  const regex = mode === 'array' ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/;
  const match = content.match(regex);
  if (match) {
    content = match[0];
  }

  // First attempt: direct parse
  try {
    return JSON.parse(content) as T;
  } catch {
    // continue to cleanup
  }

  // Remove trailing commas before } or ]
  content = content.replace(/,\s*([}\]])/g, '$1');

  // Remove single-line JS comments
  content = content.replace(/\/\/[^\n]*/g, '');

  // Second attempt after cleanup
  try {
    return JSON.parse(content) as T;
  } catch {
    // continue to truncation repair
  }

  // Attempt to repair truncated JSON by closing open brackets
  let repaired = content;
  const opens = (repaired.match(/[{[]/g) || []).length;
  const closes = (repaired.match(/[}\]]/g) || []).length;
  const missing = opens - closes;

  if (missing > 0) {
    // Trim to last complete value (remove partial strings/keys)
    repaired = repaired.replace(/,\s*"[^"]*$/, '');
    repaired = repaired.replace(/,\s*$/, '');

    // Close brackets in reverse order
    const stack: string[] = [];
    for (const ch of repaired) {
      if (ch === '{') stack.push('}');
      else if (ch === '[') stack.push(']');
      else if (ch === '}' || ch === ']') stack.pop();
    }
    repaired += stack.reverse().join('');

    try {
      return JSON.parse(repaired) as T;
    } catch {
      // final fallback: throw
    }
  }

  throw new Error(`Failed to parse JSON after cleanup:\n${raw.slice(0, 500)}`);
}

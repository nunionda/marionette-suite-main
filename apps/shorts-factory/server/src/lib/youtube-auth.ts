/**
 * youtube-auth.ts — YouTube OAuth2 token lifecycle.
 *
 * Tokens are stored in ./youtube-tokens.json (gitignored, server-side).
 * Flow: getAuthUrl() → user consents → exchangeCode(code) → getAuthenticatedClient()
 *
 * Token refresh is handled automatically: OAuth2Client emits 'tokens' on
 * every refresh, and we write the merged object back to disk so the next
 * server restart still has a valid refresh_token.
 */

import { google } from "googleapis";
import { readFile, writeFile, unlink } from "fs/promises";

const TOKEN_PATH = "./youtube-tokens.json";
const REDIRECT_URI =
  process.env.YOUTUBE_REDIRECT_URI ??
  "http://localhost:3008/api/auth/youtube/callback";
const SCOPES = ["https://www.googleapis.com/auth/youtube.upload"];

function createClient() {
  return new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID ?? "",
    process.env.YOUTUBE_CLIENT_SECRET ?? "",
    REDIRECT_URI
  );
}

/** Build the Google consent-screen URL to send the user to. */
export function getAuthUrl(): string {
  const client = createClient();
  return client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // Always return refresh_token (important after first auth)
  });
}

/** Exchange the one-time code from the OAuth callback for tokens. */
export async function exchangeCode(code: string): Promise<void> {
  const client = createClient();
  const { tokens } = await client.getToken(code);
  await writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2));
}

/**
 * Load stored tokens and return a live OAuth2Client.
 * Auto-persists refreshed tokens via the 'tokens' event.
 * Returns null if no tokens are stored yet.
 */
export async function getAuthenticatedClient() {
  try {
    const raw = await readFile(TOKEN_PATH, "utf-8");
    const tokens = JSON.parse(raw);
    const client = createClient();
    client.setCredentials(tokens);
    // Merge + persist new tokens on every auto-refresh
    client.on("tokens", async (newTokens) => {
      const merged = { ...tokens, ...newTokens };
      await writeFile(TOKEN_PATH, JSON.stringify(merged, null, 2)).catch(() => {});
    });
    return client;
  } catch {
    return null; // File not found or malformed
  }
}

/** True if we have stored tokens with at least a refresh_token. */
export async function isAuthenticated(): Promise<boolean> {
  const client = await getAuthenticatedClient();
  if (!client) return false;
  const { access_token, refresh_token, expiry_date } = client.credentials;
  if (refresh_token) return true; // Can always refresh
  if (!access_token) return false;
  if (expiry_date && expiry_date < Date.now()) return false;
  return true;
}

/** Delete stored tokens (logout). */
export async function revokeAuth(): Promise<void> {
  try {
    await unlink(TOKEN_PATH);
  } catch {}
}

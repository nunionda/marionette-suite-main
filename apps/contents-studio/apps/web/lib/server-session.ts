/**
 * Lightweight server-side session verification — no external JWT library.
 *
 * Uses the Web Crypto API (crypto.subtle) to verify the HS256 signature on
 * the `token` httpOnly cookie that the Hono auth backend sets at login. The
 * secret must match `JWT_SECRET` in the API service; both default to the same
 * dev fallback so local development works without any env config.
 *
 * Why no `jose` / `jsonwebtoken`:
 *   The web app intentionally keeps its dependency surface small. Node.js 18+
 *   and the Next.js runtime already expose `crypto.subtle` — no npm package
 *   needed for a single HMAC-SHA256 verify call.
 *
 * Usage (in a route handler):
 *   const session = await requireSession(req);
 *   if (session instanceof Response) return session; // 401 early-exit
 *   // session.userId, session.email are now available
 */

import { NextResponse } from "next/server";

const JWT_SECRET =
  process.env.JWT_SECRET ?? "marionette-dev-secret-change-in-production";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function base64urlDecode(b64url: string): Uint8Array {
  // Convert base64url → base64 → binary bytes
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (b64.length % 4)) % 4;
  const padded = b64 + "=".repeat(padLen);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function verifyHs256(
  token: string,
  secret: string,
): Promise<Record<string, unknown> | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, sigB64] = parts as [string, string, string];

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64urlDecode(sigB64),
    enc.encode(`${headerB64}.${payloadB64}`),
  );

  if (!valid) return null;

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }

  // Reject expired tokens (exp is Unix seconds)
  if (typeof payload.exp === "number" && payload.exp < Date.now() / 1000) {
    return null;
  }

  return payload;
}

function extractCookie(req: Request, name: string): string | null {
  const header = req.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key?.trim() === name) return rest.join("=");
  }
  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface SessionUser {
  userId: string;
  email: string;
}

/**
 * Verify the `token` cookie on `req`.
 *
 * Returns a `SessionUser` on success, or a 401 `NextResponse` that the
 * caller should return immediately:
 *
 *   const session = await requireSession(req);
 *   if (session instanceof Response) return session;
 */
export async function requireSession(
  req: Request,
): Promise<SessionUser | NextResponse> {
  const token = extractCookie(req, "token");
  if (!token) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const payload = await verifyHs256(token, JWT_SECRET);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  return {
    userId: String(payload.sub ?? payload.userId ?? ""),
    email: String(payload.email ?? ""),
  };
}

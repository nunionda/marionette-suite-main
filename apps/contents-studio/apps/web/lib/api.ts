export const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.INTERNAL_CONTENTS_STUDIO_API_URL ?? "http://localhost:3005");

export async function fetchAPI<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

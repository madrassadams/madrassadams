const encoder = new TextEncoder();

export const ADMIN_SESSION_COOKIE = "admin_session";

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/** HMAC-SHA256 hex digest; works in Edge (middleware) and Node (route handlers). */
export async function expectedAdminSessionToken(): Promise<string | null> {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) return null;

  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  // If ADMIN_SESSION_SECRET is unset, derive key material from password so login still works
  // when only ADMIN_PASSWORD is configured (set a dedicated secret in production).
  const keyMaterial =
    secret ?? `${password}\nmadrasa-admin-session-fallback-v1`;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(keyMaterial),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(password));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidAdminSessionCookie(
  value: string | undefined,
): Promise<boolean> {
  const expected = await expectedAdminSessionToken();
  if (!expected || !value) return false;
  return timingSafeEqualHex(expected, value);
}

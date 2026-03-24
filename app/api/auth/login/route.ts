import {
  ADMIN_SESSION_COOKIE,
  expectedAdminSessionToken,
} from "@/lib/auth/admin-session";
import { NextResponse } from "next/server";

function isBrowserFormPost(request: Request): boolean {
  const ct = request.headers.get("content-type") ?? "";
  return (
    ct.includes("application/x-www-form-urlencoded") ||
    ct.includes("multipart/form-data")
  );
}

async function parsePassword(request: Request): Promise<string | undefined> {
  if (isBrowserFormPost(request)) {
    const formData = await request.formData();
    const v = formData.get("password");
    return typeof v === "string" ? v : undefined;
  }
  const body = await request.json().catch(() => null);
  return typeof body?.password === "string" ? body.password : undefined;
}

export async function POST(request: Request) {
  const wantsRedirect = isBrowserFormPost(request);
  const password = await parsePassword(request);
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!password || !adminPassword || password !== adminPassword) {
    if (wantsRedirect) {
      return NextResponse.redirect(new URL("/login?error=1", request.url));
    }
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  let token: string | null;
  try {
    token = await expectedAdminSessionToken();
  } catch {
    token = null;
  }
  if (!token) {
    if (wantsRedirect) {
      return NextResponse.redirect(new URL("/login?error=1", request.url));
    }
    return NextResponse.json(
      { error: "Impossible de créer la session. Vérifiez ADMIN_PASSWORD dans .env.local." },
      { status: 500 },
    );
  }

  if (wantsRedirect) {
    const res = NextResponse.redirect(new URL("/", request.url));
    res.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

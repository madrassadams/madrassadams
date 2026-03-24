import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionCookie,
} from "@/lib/auth/admin-session";
import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

function isPublicPath(pathname: string): boolean {
  if (pathname === "/login") return true;
  if (pathname.startsWith("/api/auth/")) return true;
  return false;
}

function mergeSupabaseCookies(
  from: NextResponse,
  to: NextResponse,
): NextResponse {
  from.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      to.headers.append("Set-Cookie", value);
    }
  });
  return to;
}

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  if (isPublicPath(request.nextUrl.pathname)) {
    return response;
  }

  const cookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const ok = await isValidAdminSessionCookie(cookie);

  if (ok) {
    return response;
  }

  const redirect = NextResponse.redirect(new URL("/login", request.url));
  return mergeSupabaseCookies(response, redirect);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

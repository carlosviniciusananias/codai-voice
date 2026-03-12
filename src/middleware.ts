import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

export function middleware(request: NextRequest) {
  const adminToken = process.env.DX_ADMIN_TOKEN;
  const { pathname, searchParams } = request.nextUrl;
  const isDxRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/dx");

  if (adminToken && isDxRoute) {
    const tokenFromHeader = request.headers.get("x-dx-admin-token");
    const tokenFromCookie = request.cookies.get("dx_admin_token")?.value;
    const tokenFromQuery = searchParams.get("dxToken");
    const token = tokenFromHeader || tokenFromCookie || tokenFromQuery;

    if (token !== adminToken) {
      if (pathname.startsWith("/api/dx")) {
        return NextResponse.json({ error: "Unauthorized DX access." }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  const response = NextResponse.next();
  const sessionId = request.cookies.get("codai_session_id")?.value;

  if (!sessionId) {
    const newSessionId = uuidv4();
    response.cookies.set("codai_session_id", newSessionId, {
      maxAge: 60 * 60 * 24, // 24 horas
      path: "/",
      httpOnly: false, // Permitir acesso via JS para facilitar a UI
      sameSite: "lax",
    });
  }

  const queryToken = request.nextUrl.searchParams.get("dxToken");
  if (adminToken && queryToken === adminToken) {
    response.cookies.set("dx_admin_token", queryToken, {
      maxAge: 60 * 60 * 8,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

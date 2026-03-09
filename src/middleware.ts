import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const sessionId = request.cookies.get("codai_session_id")?.value;

  if (!sessionId) {
    const newSessionId = uuidv4();
    response.cookies.set("codai_session_id", newSessionId, {
      maxAge: 60 * 60 * 24, // 24 horas
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

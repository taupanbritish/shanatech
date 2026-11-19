import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, STUDENT_COOKIE } from "@/lib/auth-constants";

/**
 * Pemeriksaan cepat berbasis keberadaan cookie. Validasi sesungguhnya (tanda tangan
 * HMAC dan versi sesi di database) tetap dilakukan di server component/action.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    if (!request.cookies.has(ADMIN_COOKIE)) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!request.cookies.has(STUDENT_COOKIE)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/learn/:path*"],
};

// src/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_COOKIE = "backend-api-token";
const PUBLIC_PATHS = ["/signin"];
const PRIVATE_PATHS = ["/main", "/profile"];

const isPublic = (pathname: string) => PUBLIC_PATHS.includes(pathname);
const isPrivate = (pathname: string) => PRIVATE_PATHS.includes(pathname);

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const { pathname } = url;
  const authed = Boolean(req.cookies.get(AUTH_COOKIE)?.value);

  // root → redirect ไปตามสถานะ
  if (pathname === "/") {
    url.pathname = authed ? "/main" : "/signin";
    return NextResponse.redirect(url);
  }

  // case: user ล็อกอินแล้ว แต่ดันเข้า public → ส่งไป main
  if (authed && isPublic(pathname)) {
    url.pathname = "/main";
    return NextResponse.redirect(url);
  }

  // case: user ยังไม่ล็อกอิน แต่เข้า private → ส่งไป signin
  if (!authed && isPrivate(pathname)) {
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/signin", "/main", "/profile"],
};

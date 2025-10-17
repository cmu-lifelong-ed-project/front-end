import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getUserEdge } from "@/lib/api/user-middleware";

const AUTH_COOKIE = "backend-api-token";

const PUBLIC_PATHS = ["/signin"];
const PRIVATE_PATHS = ["/main"];
const ADMIN_ONLY_PATHS = [
  "/setting",
  "/setting/add-user",
  "/setting/edit-user",
];

const isPublic = (pathname: string) => PUBLIC_PATHS.includes(pathname);
const isPrivate = (pathname: string) => PRIVATE_PATHS.includes(pathname);
const isAdminOnly = (p: string) =>
  ADMIN_ONLY_PATHS.some((base) => p === base || p.startsWith(base + "/"));

async function fetchUserRole(token: string): Promise<string | undefined> {
  try {
    const user = await getUserEdge(token);
    return user?.role;
  } catch {
    return undefined;
  }
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const { pathname } = url;

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const authed = Boolean(token);

  // root → redirect ไปตามสถานะ
  if (pathname === "/") {
    url.pathname = authed ? "/main" : "/signin";
    return NextResponse.redirect(url);
  }

  // ล็อกอินแล้วแต่เข้าหน้า public → ส่งไป /main
  if (authed && isPublic(pathname)) {
    url.pathname = "/main";
    return NextResponse.redirect(url);
  }

  // ยังไม่ล็อกอินแต่เข้าหน้า private/admin → ส่งไป /signin
  if (!authed && (isPrivate(pathname) || isAdminOnly(pathname))) {
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  // ตรวจสอบ role เฉพาะหน้า admin
  if (isAdminOnly(pathname)) {
    const role = token ? await fetchUserRole(token) : undefined;
    if (role !== "admin") {
      url.pathname = "/main";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/signin", "/main", "/setting/:path*"],
};

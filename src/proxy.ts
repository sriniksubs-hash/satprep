// Next.js 16 convention: this file was "middleware.ts" in earlier versions.
// Runs on the Node.js runtime by default here, which matters because our
// `auth()` check goes through the `pg` driver (not Edge-compatible).
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const isProtected =
    pathname.startsWith("/practice") || pathname.startsWith("/reports");

  if (isProtected && !isLoggedIn) {
    const signInUrl = new URL("/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/practice/:path*", "/reports/:path*"],
};

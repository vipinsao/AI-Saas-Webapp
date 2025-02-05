import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes
const isPublicRoute = createRouteMatcher(["/sign-in", "/sign-up"]);

const isPublicApiRoute = createRouteMatcher(["/api/videos"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const currentUrl = new URL(req.url);
  const pathname = currentUrl.pathname;
  const isApiRequest = pathname.startsWith("/api");

  // 🚀 Redirect root ("/") based on login status
  if (pathname === "/") {
    return userId
      ? NextResponse.redirect(new URL("/home", req.url)) // If logged in, go to /home
      : NextResponse.redirect(new URL("/sign-in", req.url)); // If not logged in, go to /sign-in
  }

  // ✅ If logged in and accessing public routes like sign-in or sign-up, redirect to /home
  if (userId && isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // ❌ If NOT logged in and trying to access private routes (like /home)
  if (!userId) {
    if (!isPublicRoute(req) && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // For protected API requests
    if (isApiRequest && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  // Allow valid requests to proceed
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

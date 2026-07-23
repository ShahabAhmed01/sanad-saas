import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

function rateLimitResponse(retryAfterMs: number): NextResponse {
  const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
        "X-RateLimit-Limited": "true",
      },
    }
  );
}

export async function middleware(request: NextRequest) {
  // Skip middleware if Supabase env vars aren't configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;
  const ip = getClientIp(request);

  // Rate limit sensitive auth endpoints
  if (pathname === "/api/auth/callback" || pathname === "/login") {
    const result = checkRateLimit(ip, RATE_LIMITS.login);
    if (!result.allowed) return rateLimitResponse(result.retryAfterMs);
  }

  if (pathname === "/signup" || (pathname === "/api/setup" && request.method === "POST")) {
    const result = checkRateLimit(ip, RATE_LIMITS.signup);
    if (!result.allowed) return rateLimitResponse(result.retryAfterMs);
  }

  if (pathname === "/forgot-password") {
    const result = checkRateLimit(ip, RATE_LIMITS.forgotPassword);
    if (!result.allowed) return rateLimitResponse(result.retryAfterMs);
  }

  if (pathname === "/api/setup") {
    const result = checkRateLimit(ip, RATE_LIMITS.setup);
    if (!result.allowed) return rateLimitResponse(result.retryAfterMs);
  }

  // General API rate limit
  if (pathname.startsWith("/api/")) {
    const result = checkRateLimit(ip, RATE_LIMITS.api);
    if (!result.allowed) return rateLimitResponse(result.retryAfterMs);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

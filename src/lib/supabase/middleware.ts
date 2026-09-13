import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { supabaseUrl, supabaseAnonKey, isConfigured } = getSupabaseEnv();

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute =
    pathname.startsWith("/character-discovery") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/quests") ||
    pathname.startsWith("/character") ||
    pathname.startsWith("/nightly-camp") ||
    pathname.startsWith("/shop");
  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  // If Supabase credentials are not configured, handle gracefully
  if (!isConfigured) {
    if (isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectedFrom", pathname);
      url.searchParams.set("error", "unconfigured");
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: DO NOT use supabase.auth.getSession() in server code.
  // getSession() does not guarantee that the JWT is cryptographically valid.
  // getUser() validates the token against the Supabase Auth server.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // CASE 1: Unauthenticated user visits protected route
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  // CASE 2: Authenticated user visits /login or /signup
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/character-discovery";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

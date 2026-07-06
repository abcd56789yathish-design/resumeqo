import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    console.error("[auth/callback] OAuth error:", error);
    return NextResponse.redirect(new URL("/login?error=oauth_denied", request.url));
  }

  if (code) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return request.cookies.getAll(); },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            },
          },
        }
      );
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        console.error("[auth/callback] Exchange error:", exchangeError);
        return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
      }
    } catch (err) {
      console.error("[auth/callback] Unexpected error:", err);
      return NextResponse.redirect(new URL("/login?error=unknown", request.url));
    }
  }

  return NextResponse.redirect(new URL("/review", request.url));
}

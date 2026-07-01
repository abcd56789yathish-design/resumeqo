// ============================================
// NAVBAR - Sticky glass header with auth
// ============================================

import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import NavbarMenu from "@/components/NavbarMenu";

export default async function Navbar() {
  let user = null;
  try {
    const supabase = await createClient();
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {} // env vars missing or auth unavailable — treat as signed out

  return (
    <header className="sticky top-0 z-50 bg-[var(--paper)]/88 backdrop-blur-md border-b border-[var(--line)]">
      <nav className="max-w-[1140px] mx-auto px-8 flex items-center justify-between h-[60px]">
        <Link href="/" className="font-mono font-semibold text-[15px] tracking-tight flex items-center gap-2">
          <span className="w-[20px] h-[20px] bg-[var(--coral)] rounded-[3px] inline-block relative">
            <span className="absolute left-[4px] top-[5px] w-[8px] h-[2px] bg-[var(--paper)]"></span>
            <span className="absolute left-[4px] top-[9px] w-[12px] h-[2px] bg-[var(--paper)]"></span>
          </span>
          resumeqo
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-[var(--ink-soft)]">
          <a href="/" className="hover:text-[var(--ink)] transition-colors">Home</a>
          <a href="/review" className="hover:text-[var(--ink)] transition-colors">How it works</a>
          <a href="/pricing" className="hover:text-[var(--ink)] transition-colors">Pricing</a>
        </div>

        {user ? (
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-[var(--ink-soft)]">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="font-mono text-[13px] font-medium bg-[var(--coral)] text-white px-[18px] py-[10px] rounded-[3px] hover:bg-[var(--coral-dark)] transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/login"
            className="hidden md:inline-block font-mono text-[13px] font-medium bg-[var(--ink)] text-[var(--paper)] px-[18px] py-[10px] rounded-[3px] border border-[var(--ink)] hover:bg-[var(--coral)] hover:border-[var(--coral)] transition-colors"
          >
            Sign in ?
          </Link>
        )}

        <NavbarMenu>
          <Link href="/" className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]">Home</Link>
          <Link href="/review" className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]">How it works</Link>
          <Link href="/pricing" className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]">Pricing</Link>
          {user ? (
            <>
              <span className="text-sm text-[var(--ink-soft)]">{user.email}</span>
              <form action="/auth/signout" method="post">
                <button type="submit" className="font-mono text-[13px] font-medium bg-[var(--coral)] text-white px-[18px] py-[10px] rounded-[3px] text-center mt-2 w-full">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="font-mono text-[13px] font-medium bg-[var(--ink)] text-[var(--paper)] px-[18px] py-[10px] rounded-[3px] border border-[var(--ink)] text-center mt-2">
              Sign in ?
            </Link>
          )}
        </NavbarMenu>
      </nav>
    </header>
  );
}

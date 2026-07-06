"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignUp() {
    setLoading(true);
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (password !== confirmPwd) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    let failure;
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      failure = error;
    } catch {
      failure = { message: "Something went wrong. Please try again." };
    }

    if (failure) {
      setError(failure.message);
      setLoading(false);
      return;
    }

    router.push("/login?check_email=true");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--paper)] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-mono font-semibold text-lg tracking-tight flex items-center justify-center gap-2 text-[var(--ink)]">
            <span className="w-5 h-5 bg-[var(--coral)] rounded inline-block relative">
              <span className="absolute left-[4px] top-[5px] w-2 h-0.5 bg-[var(--paper)]"></span>
              <span className="absolute left-[4px] top-[9px] w-3 h-0.5 bg-[var(--paper)]"></span>
            </span>
            resumeqo
          </Link>
        </div>

        <div className="bg-[var(--paper-card)] rounded-2xl shadow-sm border border-[var(--line)] p-8">
          <h1 className="text-2xl font-semibold text-[var(--ink)] mb-1">Create an account</h1>
          <p className="text-sm text-[var(--ink-soft)] mb-8">Get started with your resume review journey.</p>

          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--ink-soft)] mb-1.5">Full name</label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[var(--paper)] border border-[var(--line)] rounded-lg text-[var(--ink)] placeholder:text-[var(--ink-soft)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--coral)]/20 focus:border-[var(--coral)] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--ink-soft)] mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[var(--paper)] border border-[var(--line)] rounded-lg text-[var(--ink)] placeholder:text-[var(--ink-soft)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--coral)]/20 focus:border-[var(--coral)] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="pwd" className="block text-sm font-medium text-[var(--ink-soft)] mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="pwd"
                  type={showPwd ? "text" : "password"}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[var(--paper)] border border-[var(--line)] rounded-lg text-[var(--ink)] placeholder:text-[var(--ink-soft)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--coral)]/20 focus:border-[var(--coral)] transition-colors pr-10"
                />
                <button
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
                  tabIndex={-1}
                  type="button"
                  aria-label="Toggle password visibility"
                >
                  {showPwd ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/>
                      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/>
                      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.455-5.143"/>
                      <path d="M2 2l20 20"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0-4 0"/>
                      <path d="M21 12c-2.4 4-5.4 6-9 6c-3.6 0-6.6-2-9-6c2.4-4 5.4-6 9-6c3.6 0 6.6 2 9 6"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-pwd" className="block text-sm font-medium text-[var(--ink-soft)] mb-1.5">Confirm password</label>
              <input
                id="confirm-pwd"
                type="password"
                placeholder="Re-enter your password"
                autoComplete="new-password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignUp()}
                className="w-full px-3.5 py-2.5 text-sm bg-[var(--paper)] border border-[var(--line)] rounded-lg text-[var(--ink)] placeholder:text-[var(--ink-soft)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--coral)]/20 focus:border-[var(--coral)] transition-colors"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                {error}
              </div>
            )}

            <button
              onClick={handleSignUp}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[var(--ink)] text-[var(--paper)] text-sm font-medium rounded-lg hover:bg-[var(--coral)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? "Creating account\u2026" : "Create account"}
            </button>
          </div>

          <p className="text-center text-sm text-[var(--ink-soft)] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--coral)] font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

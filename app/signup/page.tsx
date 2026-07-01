"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSignup() {
    setLoading(true);
    setError("");
    let failure;
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({ email, password });
      failure = error;
    } catch {
      failure = { message: "Something went wrong. Please try again." };
    }
    if (failure) {
      setError(failure.message);
      setLoading(false);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)] px-6">
        <div className="w-full max-w-[400px] bg-[var(--paper-card)] border border-[var(--line)] rounded-[3px] p-8 text-center animate-fade-in">
          <div className="w-12 h-12 bg-[var(--green-light)] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--green)" strokeWidth="2">
              <path d="M4 10L8 14L16 6" />
            </svg>
          </div>
          <h1 className="font-serif text-[24px] leading-tight mb-2">Check your email</h1>
          <p className="text-sm text-[var(--ink-soft)] mb-6">
            We sent a confirmation link to <strong className="text-[var(--ink)]">{email}</strong>
          </p>
          <Link
            href="/login"
            className="inline-block font-mono text-[13px] font-medium bg-[var(--ink)] text-[var(--paper)] px-[18px] py-[10px] rounded-[3px] border border-[var(--ink)] hover:bg-[var(--coral)] hover:border-[var(--coral)] transition-colors"
          >
            Sign in →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-60px)] px-6">
      <div className="w-full max-w-[400px] bg-[var(--paper-card)] border border-[var(--line)] rounded-[3px] p-8 animate-fade-in">
        <h1 className="font-serif text-[28px] leading-tight mb-1">Create account</h1>
        <p className="text-sm text-[var(--ink-soft)] mb-8">Get your resume reviewed in seconds</p>

        <div className="flex flex-col gap-5">
          <div>
            <label className="text-xs font-medium text-[var(--ink-soft)] mb-1 block">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
              className="w-full px-3 py-[10px] border border-[var(--line)] rounded-[3px] bg-[var(--paper)] text-sm text-[var(--ink)] placeholder:text-[var(--line)] outline-none focus:border-[var(--ink)] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--ink-soft)] mb-1 block">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              type="password"
              className="w-full px-3 py-[10px] border border-[var(--line)] rounded-[3px] bg-[var(--paper)] text-sm text-[var(--ink)] placeholder:text-[var(--line)] outline-none focus:border-[var(--ink)] transition-colors"
            />
          </div>

          {error && (
            <p className="text-[13px] text-[var(--coral)] bg-[var(--coral-light)] px-3 py-2 rounded-[3px]">{error}</p>
          )}

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full font-mono text-[13px] font-medium bg-[var(--ink)] text-[var(--paper)] px-[18px] py-[10px] rounded-[3px] border border-[var(--ink)] hover:bg-[var(--coral)] hover:border-[var(--coral)] transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign up →"}
          </button>
        </div>

        <p className="text-sm text-[var(--ink-soft)] text-center mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--ink)] font-medium underline underline-offset-2 hover:text-[var(--coral)] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

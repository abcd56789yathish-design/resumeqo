"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError("");
    let failure;
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      failure = error;
    } catch {
      failure = { message: "Something went wrong. Please try again." };
    }
    if (failure) {
      setError(failure.message);
      setLoading(false);
      return;
    }
    router.push("/review");
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-60px)] px-6">
      <div className="w-full max-w-[400px] bg-[var(--paper-card)] border border-[var(--line)] rounded-[3px] p-8 animate-fade-in">
        <h1 className="font-serif text-[28px] leading-tight mb-1">Welcome back</h1>
        <p className="text-sm text-[var(--ink-soft)] mb-8">Sign in to your account</p>

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
              placeholder="Enter your password"
              type="password"
              className="w-full px-3 py-[10px] border border-[var(--line)] rounded-[3px] bg-[var(--paper)] text-sm text-[var(--ink)] placeholder:text-[var(--line)] outline-none focus:border-[var(--ink)] transition-colors"
            />
          </div>

          {error && (
            <p className="text-[13px] text-[var(--coral)] bg-[var(--coral-light)] px-3 py-2 rounded-[3px]">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full font-mono text-[13px] font-medium bg-[var(--ink)] text-[var(--paper)] px-[18px] py-[10px] rounded-[3px] border border-[var(--ink)] hover:bg-[var(--coral)] hover:border-[var(--coral)] transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in →"}
          </button>
        </div>

        <p className="text-sm text-[var(--ink-soft)] text-center mt-6">
          No account?{" "}
          <Link href="/signup" className="text-[var(--ink)] font-medium underline underline-offset-2 hover:text-[var(--coral)] transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

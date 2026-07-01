"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError("");
    let failure;
    try {
      const supabase = createClient();
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        failure = error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        failure = error;
      }
    } catch {
      failure = { message: "Something went wrong. Please try again." };
    }
    if (failure) {
      setError(failure.message);
      setLoading(false);
      return;
    }
    if (mode === "signin") {
      router.push("/review");
    } else {
      setDone(true);
    }
  }

  function switchMode(m: Mode) {
    setMode(m);
    setError("");
  }

  if (mode === "signup" && done) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)] px-6">
        <div className="w-full max-w-[420px] bg-[var(--paper-card)] border border-[var(--line)] rounded-[3px] p-10 text-center animate-fade-in">
          <div className="w-14 h-14 bg-[var(--green-light)] rounded-full flex items-center justify-center mx-auto mb-5">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 11L8 15L18 5" />
            </svg>
          </div>
          <h1 className="font-serif text-[26px] leading-tight mb-2">Check your email</h1>
          <p className="text-sm text-[var(--ink-soft)] leading-relaxed mb-8">
            We sent a confirmation link to<br />
            <strong className="text-[var(--ink)]">{email}</strong>
          </p>
          <button
            onClick={() => { setMode("signin"); setDone(false); setEmail(""); setPassword(""); }}
            className="font-mono text-[13px] font-medium bg-[var(--ink)] text-[var(--paper)] px-[22px] py-[10px] rounded-[3px] border border-[var(--ink)] hover:bg-[var(--coral)] hover:border-[var(--coral)] transition-colors"
          >
            Sign in →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-60px)] px-6">
      <div className="w-full max-w-[420px] animate-fade-in">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-[22px] h-[22px] bg-[var(--coral)] rounded-[3px] inline-flex items-center justify-center">
              <span className="w-[9px] h-[2px] bg-[var(--paper)] block mb-[3px]"></span>
              <span className="w-[13px] h-[2px] bg-[var(--paper)] block"></span>
            </span>
            <span className="font-mono font-semibold text-sm tracking-tight text-[var(--ink)]">resumeqo</span>
          </div>
          <h1 className="font-serif text-[32px] leading-[1.15]">
            {mode === "signin" ? "Welcome back" : "Get started"}
          </h1>
          <p className="text-sm text-[var(--ink-soft)] mt-2">
            {mode === "signin" ? "Sign in to your account" : "Create your free account"}
          </p>
        </div>

        {/* Auth card */}
        <div className="bg-[var(--paper-card)] border border-[var(--line)] rounded-[3px] p-8">
          {/* Mode tabs */}
          <div className="flex border border-[var(--line)] rounded-[3px] overflow-hidden mb-8">
            <button
              onClick={() => switchMode("signin")}
              className={`flex-1 py-[9px] text-[13px] font-medium transition-colors ${
                mode === "signin"
                  ? "bg-[var(--ink)] text-[var(--paper)]"
                  : "bg-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => switchMode("signup")}
              className={`flex-1 py-[9px] text-[13px] font-medium transition-colors ${
                mode === "signup"
                  ? "bg-[var(--ink)] text-[var(--paper)]"
                  : "bg-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              Sign up
            </button>
          </div>

          <div className="flex flex-col gap-[18px]">
            <div>
              <label className="text-xs font-medium text-[var(--ink-soft)] mb-1.5 block">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
                className="w-full px-3 py-[10px] border border-[var(--line)] rounded-[3px] bg-[var(--paper)] text-sm text-[var(--ink)] placeholder:text-[var(--line)] outline-none focus:border-[var(--ink)] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--ink-soft)] mb-1.5 block">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Create a password" : "Enter your password"}
                type="password"
                className="w-full px-3 py-[10px] border border-[var(--line)] rounded-[3px] bg-[var(--paper)] text-sm text-[var(--ink)] placeholder:text-[var(--line)] outline-none focus:border-[var(--ink)] transition-colors"
              />
            </div>

            {error && (
              <p className="text-[13px] text-[var(--coral)] bg-[var(--coral-light)] px-3 py-2.5 rounded-[3px] leading-relaxed">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full font-mono text-[13px] font-medium bg-[var(--ink)] text-[var(--paper)] px-[18px] py-[10px] rounded-[3px] border border-[var(--ink)] hover:bg-[var(--coral)] hover:border-[var(--coral)] transition-colors disabled:opacity-50 mt-1"
            >
              {loading
                ? mode === "signin" ? "Signing in..." : "Creating account..."
                : mode === "signin" ? "Sign in →" : "Create account →"
              }
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[12px] text-[var(--ink-soft)] mt-6 leading-relaxed">
          By continuing, you agree to our{" "}
          <a href="#" className="underline underline-offset-2 hover:text-[var(--ink)] transition-colors">Terms</a>
          {" "}and{" "}
          <a href="#" className="underline underline-offset-2 hover:text-[var(--ink)] transition-colors">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}

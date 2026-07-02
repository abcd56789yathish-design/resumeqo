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
      <div className="flex min-h-[calc(100vh-60px)]">
        {/* Left brand side */}
        <div className="hidden lg:flex w-1/2 bg-[var(--ink)] items-center justify-center p-12">
          <div className="max-w-[380px]">
            <div className="w-[52px] h-[52px] bg-[var(--coral)] rounded-[4px] flex items-center justify-center mb-8">
              <span className="w-[16px] h-[3px] bg-[var(--paper)] block mb-[5px]"></span>
              <span className="w-[24px] h-[3px] bg-[var(--paper)] block"></span>
            </div>
            <h2 className="font-serif text-[32px] leading-[1.15] text-[var(--paper)] mb-4">
              You&apos;re almost there
            </h2>
            <p className="text-[#B8BFD4] text-[15px] leading-relaxed">
              Check your inbox and confirm your email address to unlock your free resume review.
            </p>
          </div>
        </div>
        {/* Right side */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-[400px] text-center">
            <div className="w-14 h-14 bg-[var(--green-light)] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12L9 17L20 6" />
              </svg>
            </div>
            <h1 className="font-serif text-[28px] leading-tight mb-2">Check your email</h1>
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
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-60px)]">
      {/* Left brand side */}
      <div className="hidden lg:flex w-1/2 bg-[var(--ink)] items-center justify-center p-12 relative overflow-hidden">
        <div className="max-w-[400px] relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <span className="w-[32px] h-[32px] bg-[var(--coral)] rounded-[4px] inline-flex items-center justify-center">
              <span className="w-[10px] h-[2px] bg-[var(--paper)] block mb-[3px]"></span>
              <span className="w-[15px] h-[2px] bg-[var(--paper)] block"></span>
            </span>
            <span className="font-mono font-semibold text-[16px] tracking-tight text-[var(--paper)]">resumeqo</span>
          </div>

          {/* Hero text */}
          <h2 className="font-serif text-[36px] leading-[1.1] text-[var(--paper)] mb-5">
            {mode === "signin" ? "Your resume deserves a second look." : "Start with a free review."}
          </h2>
          <p className="text-[#B8BFD4] text-[15px] leading-relaxed mb-10">
            {mode === "signin"
              ? "Sign in to access your past reviews, save progress, and get back to landing interviews."
              : "Upload your resume and get a full AI analysis — score, line edits, ATS check — in under 10 seconds."}
          </p>

          {/* Resume illustration */}
          <div className="relative w-full max-w-[300px] bg-white/5 border border-white/10 rounded-[3px] p-6">
            <div className="font-serif font-[500] text-[17px] text-white/80">Alex Morgan</div>
            <div className="text-[11px] text-[#B8BFD4] mt-[2px]">
              Product Manager · alex@email.com
            </div>
            <hr className="border-none border-t border-white/10 my-[12px]" />
            <div className="font-mono text-[9px] tracking-[0.08em] text-white/40 uppercase mt-[12px] mb-[6px]">Experience</div>
            <div className="h-[6px] bg-white/10 rounded-[2px] mb-[5px] w-full"></div>
            <div className="h-[6px] bg-white/10 rounded-[2px] mb-[5px] w-[85%]"></div>
            <div className="h-[6px] bg-white/10 rounded-[2px] mb-[5px] w-[70%]"></div>
            <div className="font-mono text-[9px] tracking-[0.08em] text-white/40 uppercase mt-[12px] mb-[6px]">Skills</div>
            <div className="h-[6px] bg-white/10 rounded-[2px] mb-[5px] w-[50%]"></div>
            <div className="h-[6px] bg-white/10 rounded-[2px] mb-[5px] w-[65%]"></div>
          </div>

          {/* Trust line */}
          <div className="mt-10 text-[12px] text-[#7B83A2]">
            Trusted by job seekers headed to Google, Stripe, Figma & more
          </div>
        </div>
      </div>

      {/* Right auth side */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px] animate-fade-in">
          {/* Logo for mobile */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <span className="w-[20px] h-[20px] bg-[var(--coral)] rounded-[3px] inline-flex items-center justify-center">
              <span className="w-[8px] h-[2px] bg-[var(--paper)] block mb-[2px]"></span>
              <span className="w-[12px] h-[2px] bg-[var(--paper)] block"></span>
            </span>
            <span className="font-mono font-semibold text-sm tracking-tight text-[var(--ink)]">resumeqo</span>
          </div>

          <h1 className="font-serif text-[30px] leading-[1.15] mb-1">
            {mode === "signin" ? "Welcome back" : "Get started"}
          </h1>
          <p className="text-[14px] text-[var(--ink-soft)] mb-8">
            {mode === "signin" ? "Sign in to your account to continue" : "Create an account to get your resume reviewed"}
          </p>

          {/* Tab toggle */}
          <div className="flex gap-1 bg-[var(--line)]/40 rounded-[4px] p-[3px] mb-8">
            <button
              onClick={() => switchMode("signin")}
              className={`flex-1 py-[8px] text-[12px] font-medium rounded-[3px] transition-all ${
                mode === "signin"
                  ? "bg-[var(--paper-card)] text-[var(--ink)] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                  : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => switchMode("signup")}
              className={`flex-1 py-[8px] text-[12px] font-medium rounded-[3px] transition-all ${
                mode === "signup"
                  ? "bg-[var(--paper-card)] text-[var(--ink)] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                  : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              Create account
            </button>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-[18px]">
            <div>
              <label className="text-[12px] font-medium text-[var(--ink-soft)] mb-[6px] block">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
                className="w-full px-3 py-[11px] border border-[var(--line)] rounded-[4px] bg-[var(--paper)] text-[14px] text-[var(--ink)] placeholder:text-[var(--line)] outline-none focus:border-[var(--ink)] transition-colors"
              />
            </div>

            <div>
              <label className="text-[12px] font-medium text-[var(--ink-soft)] mb-[6px] block">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "At least 6 characters" : "Enter your password"}
                type="password"
                className="w-full px-3 py-[11px] border border-[var(--line)] rounded-[4px] bg-[var(--paper)] text-[14px] text-[var(--ink)] placeholder:text-[var(--line)] outline-none focus:border-[var(--ink)] transition-colors"
              />
              {mode === "signup" && (
                <p className="text-[11px] text-[var(--ink-soft)] mt-[6px]">Minimum 6 characters</p>
              )}
            </div>

            {error && (
              <p className="text-[13px] text-[var(--coral)] bg-[var(--coral-light)] px-3 py-2.5 rounded-[3px] leading-relaxed">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full font-mono text-[13px] font-medium bg-[var(--ink)] text-[var(--paper)] py-[11px] rounded-[3px] border border-[var(--ink)] hover:bg-[var(--coral)] hover:border-[var(--coral)] transition-colors disabled:opacity-50 mt-[6px]"
            >
              {loading
                ? mode === "signin" ? "Signing in..." : "Creating account..."
                : mode === "signin" ? "Sign in" : "Create account"
              }
            </button>
          </div>

          <p className="text-center text-[11px] text-[var(--ink-soft)] mt-8 leading-relaxed">
            By continuing, you agree to our{" "}
            <a href="#" className="underline underline-offset-2 hover:text-[var(--ink)] transition-colors">Terms</a>
            {" "}and{" "}
            <a href="#" className="underline underline-offset-2 hover:text-[var(--ink)] transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}

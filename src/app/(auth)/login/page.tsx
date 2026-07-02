"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = document.querySelectorAll(".anim");
    const delays = [80, 280, 360, 420, 500, 570, 630, 700];
    els.forEach((el, i) => {
      setTimeout(() => el.classList.add("visible"), delays[i] || 800);
    });
  }, []);

  async function handleSignIn() {
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

  const css = [
    "*{box-sizing:border-box;margin:0;padding:0}",
    ":root{--ease-out:cubic-bezier(0.16,1,0.3,1);--radius:8px}",
    "body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f0f0f8;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem 1rem}",
    ".card{background:#fff;border-radius:20px;padding:2.5rem 2rem;width:100%;max-width:420px;box-shadow:0 4px 24px rgba(0,0,0,0.07);opacity:0;transform:translateY(40px) scale(0.97);transition:opacity 0.7s var(--ease-out),transform 0.7s var(--ease-out)}",
    ".card.visible{opacity:1;transform:translateY(0) scale(1)}",
    "h1{font-size:26px;font-weight:600;color:#111;margin-bottom:6px}",
    ".subtitle{font-size:14px;color:#888;margin-bottom:1.75rem}",
    ".google-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:11px 16px;border:1px solid #e0e0e0;border-radius:var(--radius);background:#fff;cursor:pointer;font-size:14px;font-weight:500;color:#333;transition:background 0.18s,box-shadow 0.18s,transform 0.12s;margin-bottom:1.5rem}",
    ".google-btn:hover{background:#f8f8f8;box-shadow:0 2px 10px rgba(0,0,0,0.08)}",
    ".google-btn:active{transform:scale(0.98)}",
    ".google-btn svg{width:18px;height:18px;flex-shrink:0}",
    ".divider{display:flex;align-items:center;gap:12px;margin-bottom:1.5rem}",
    ".divider::before,.divider::after{content:'';flex:1;height:1px;background:#eee}",
    ".divider span{font-size:12px;color:#aaa}",
    ".field{margin-bottom:1.2rem;opacity:0;transform:translateY(16px);transition:opacity 0.5s var(--ease-out),transform 0.5s var(--ease-out)}",
    ".field.visible{opacity:1;transform:translateY(0)}",
    "label{display:block;font-size:13px;font-weight:500;color:#555;margin-bottom:6px}",
    ".input-wrap{position:relative}",
    "input[type=email],input[type=password],input[type=text]{width:100%;padding:11px 14px;border:1px solid #e0e0e0;border-radius:var(--radius);background:#fafafa;color:#111;font-size:14px;font-family:inherit;transition:border-color 0.18s,box-shadow 0.18s;outline:none}",
    "input[type=password],input[type=text]{padding-right:42px}",
    "input:focus{border-color:#5450E4;box-shadow:0 0 0 3px rgba(84,80,228,0.12)}",
    ".eye-btn{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#aaa;display:flex;align-items:center;padding:2px;transition:color 0.15s}",
    ".eye-btn:hover{color:#555}",
    ".row{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;opacity:0;transform:translateY(12px);transition:opacity 0.5s var(--ease-out),transform 0.5s var(--ease-out)}",
    ".row.visible{opacity:1;transform:translateY(0)}",
    ".check-wrap{display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:#555}",
    ".check-wrap input[type=checkbox]{accent-color:#5450E4;width:15px;height:15px}",
    ".forgot{font-size:13px;color:#5450E4;text-decoration:none;transition:opacity 0.15s}",
    ".forgot:hover{opacity:0.75}",
    ".sign-btn{width:100%;padding:13px;border:none;border-radius:50px;background:#5450E4;color:#fff;font-size:15px;font-weight:500;cursor:pointer;transition:background 0.18s,transform 0.12s,box-shadow 0.18s;opacity:0;transform:translateY(12px);transition:opacity 0.5s 0.55s var(--ease-out),transform 0.5s 0.55s var(--ease-out)}",
    ".sign-btn.visible{opacity:1;transform:translateY(0)}",
    ".sign-btn:hover{background:#4340c8;box-shadow:0 4px 18px rgba(84,80,228,0.35)}",
    ".sign-btn:active{transform:scale(0.98)}",
    ".sign-btn.loading{pointer-events:none;background:#7874ec}",
    ".footer-txt{text-align:center;font-size:13px;color:#aaa;margin-top:1.25rem;opacity:0;transition:opacity 0.5s 0.65s}",
    ".footer-txt.visible{opacity:1}",
    ".footer-txt a{color:#5450E4;text-decoration:none;font-weight:500}",
    ".footer-txt a:hover{text-decoration:underline}",
    ".error-msg{font-size:13px;color:#e53e3e;background:#fff5f5;padding:10px 14px;border-radius:var(--radius);margin-bottom:1rem;opacity:0;transition:opacity 0.3s}",
    ".error-msg.visible{opacity:1}",
  ].join("");
  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: css }} />

    <div className="card anim" ref={cardRef}>
      <h1>Welcome back</h1>
      <p className="subtitle">Enter your details to access your account.</p>

      <button className="google-btn anim">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign in with Google
      </button>

      <div className="divider anim"><span>or</span></div>

      <div className="field anim">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="field anim">
        <label htmlFor="pwd">Password</label>
        <div className="input-wrap">
          <input
            id="pwd"
            type={showPwd ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="eye-btn"
            onClick={() => setShowPwd(!showPwd)}
            aria-label="Toggle password visibility"
            type="button"
          >
            {showPwd ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/>
                <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/>
                <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.455-5.143"/>
                <path d="M2 2l20 20"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0-4 0"/>
                <path d="M21 12c-2.4 4-5.4 6-9 6c-3.6 0-6.6-2-9-6c2.4-4 5.4-6 9-6c3.6 0 6.6 2 9 6"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {error && <div className="error-msg visible">{error}</div>}

      <div className="row anim">
        <label className="check-wrap">
          <input type="checkbox" defaultChecked /> Remember me
        </label>
        <a href="#" className="forgot">Forgot password?</a>
      </div>

      <button
        className={`sign-btn anim${loading ? " loading" : ""}`}
        onClick={handleSignIn}
        disabled={loading}
        type="button"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <p className="footer-txt anim">
        Don&apos;t have an account? <Link href="/signup">Register</Link>
      </p>
    </div>
    </>);
}

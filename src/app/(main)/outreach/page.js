"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, Sparkles, MessageSquare, Mail, Copy,
  CheckCircle, AlertCircle, X, Lock, RefreshCw, Send
} from "lucide-react";

const PRO_KEY = "resumeqo_pro";

function isPro() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PRO_KEY) === "true";
}

export default function OutreachPage() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [messageType, setMessageType] = useState("linkedin");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("resumeqo_resume_text");
    if (stored) setResumeText(stored);
  }, []);

  const handleGenerate = async () => {
    if (!isPro()) {
      setShowUpgrade(true);
      return;
    }

    if (!resumeText.trim() || resumeText.trim().length < 20) {
      setError("Please provide your resume text.");
      return;
    }
    if (!targetRole.trim()) {
      setError("Please enter the target role.");
      return;
    }
    if (!targetCompany.trim()) {
      setError("Please enter the target company.");
      return;
    }

    setError("");
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeText.trim(),
          targetRole: targetRole.trim(),
          targetCompany: targetCompany.trim(),
          messageType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate message.");

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.message) return;
    navigator.clipboard.writeText(result.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  return (
    <div className="relative z-[1] min-h-screen py-16 px-8">
      <div className="max-w-[640px] mx-auto">
        <div className="text-center mb-10">
          <div className={`font-mono text-[12px] tracking-[0.06em] uppercase flex items-center justify-center gap-2 mb-4 ${isPro() ? "text-[var(--green)]" : "text-[var(--coral-dark)]"}`}>
            <span className={`w-[6px] h-[6px] rounded-full animate-pulse-dot ${isPro() ? "bg-[var(--green)]" : "bg-[var(--coral)]"}`}></span>
            {isPro() ? "Pro feature — full access" : "Pro feature"}
            {!isPro() && (
              <button onClick={() => { localStorage.setItem(PRO_KEY, "true"); window.location.reload(); }} className="font-mono text-[10px] text-[var(--coral)] hover:text-[var(--coral-dark)] underline ml-1">
                Enable Pro (dev)
              </button>
            )}
          </div>
          <h1 className="font-serif font-[500] text-[clamp(32px,4vw,42px)] leading-[1.1] text-[var(--ink)]">
            Cold Outreach Writer
          </h1>
          <p className="text-[var(--ink-soft)] text-[17px] mt-3">
            AI drafts a short, personalized LinkedIn DM or email referencing your resume strengths — tailored to a specific role and company.
          </p>
        </div>

        <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--ink-soft)] mb-2">
              Your Resume Text
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              rows={6}
              className="w-full px-4 py-3 border border-[var(--line)] rounded-[3px] focus:outline-none focus:border-[var(--ink)] transition-colors text-[var(--ink)] bg-transparent resize-none font-mono text-[13px]"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ink-soft)] mb-1">
                Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Senior Product Manager"
                className="w-full px-4 py-2.5 border border-[var(--line)] rounded-[3px] focus:outline-none focus:border-[var(--ink)] transition-colors text-[var(--ink)] bg-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink-soft)] mb-1">
                Target Company
              </label>
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="e.g., Google"
                className="w-full px-4 py-2.5 border border-[var(--line)] rounded-[3px] focus:outline-none focus:border-[var(--ink)] transition-colors text-[var(--ink)] bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--ink-soft)] mb-3">
              Message Type
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setMessageType("linkedin")}
                className={`flex-1 font-mono text-[13px] py-3 px-4 rounded-[3px] transition-all flex items-center justify-center gap-2 ${
                  messageType === "linkedin"
                    ? "bg-[var(--ink)] text-white"
                    : "bg-[var(--paper-card)] border border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink)]"
                }`}
              >
                <MessageSquare className="w-4 h-4" /> LinkedIn DM
              </button>
              <button
                onClick={() => setMessageType("email")}
                className={`flex-1 font-mono text-[13px] py-3 px-4 rounded-[3px] transition-all flex items-center justify-center gap-2 ${
                  messageType === "email"
                    ? "bg-[var(--ink)] text-white"
                    : "bg-[var(--paper-card)] border border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink)]"
                }`}
              >
                <Mail className="w-4 h-4" /> Email
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-[var(--coral-light)] border border-[var(--coral)] rounded-[3px] p-4 text-[var(--coral-dark)] text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className={`w-full font-mono text-[14px] font-medium rounded-[3px] transition-all flex items-center justify-center gap-2 py-[15px] ${
              isLoading
                ? "bg-[var(--line)] text-[var(--ink-soft)] cursor-not-allowed"
                : "bg-[var(--coral)] text-white shadow-[3px_3px_0_var(--coral-dark)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_var(--coral-dark)]"
            }`}
          >
            {isLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Writing your message...</>
            ) : (
              <><Send className="w-5 h-5" /> Generate Outreach Message</>
            )}
          </button>
        </div>

        {result && (
          <div className="mt-8 space-y-4">
            <div className="text-center">
              <span className="font-mono text-[12px] tracking-[0.06em] text-[var(--green)] uppercase block mb-2">
                Your {result.type === "linkedin" ? "LinkedIn DM" : "Email"} Ready
              </span>
              <h2 className="font-serif font-[500] text-[clamp(20px,2.5vw,26px)] text-[var(--ink)]">
                Outreach to {targetCompany}
              </h2>
            </div>

            <div className="bg-[var(--green-light)] border border-[var(--green)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-8">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--green)]/30">
                {result.type === "linkedin" ? (
                  <MessageSquare className="w-5 h-5 text-[var(--green)]" />
                ) : (
                  <Mail className="w-5 h-5 text-[var(--green)]" />
                )}
                <span className="font-mono text-[11px] text-[var(--green)] uppercase tracking-[0.05em]">
                  {result.type === "linkedin" ? "LinkedIn Message" : "Email Draft"}
                </span>
                <span className="font-mono text-[10px] text-[var(--green)]/60 ml-auto">
                  ~{result.message.split(" ").length} words
                </span>
              </div>
              <p className="whitespace-pre-wrap text-[15px] text-[var(--ink)] leading-relaxed">
                {result.message}
              </p>
              <div className="mt-6 pt-4 border-t border-[var(--green)]/30 flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleCopy}
                  className="font-mono text-[12px] bg-[var(--green)] text-white px-5 py-2.5 rounded-[3px] hover:bg-[var(--green)]/80 transition-all flex items-center gap-2"
                >
                  {copied ? <><CheckCircle className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy to Clipboard</>}
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={isLoading}
                  className="font-mono text-[12px] bg-[var(--paper-card)] text-[var(--ink)] border border-[var(--line)] px-5 py-2.5 rounded-[3px] hover:bg-[var(--line)] transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Regenerate
                </button>
              </div>
            </div>

            <div className="bg-[var(--paper-card)] border border-[var(--line)] p-5 rounded-[3px]">
              <h4 className="font-mono text-[11px] text-[var(--ink-soft)] uppercase tracking-[0.05em] mb-2">Tips</h4>
              <ul className="space-y-1 text-sm text-[var(--ink-soft)]">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--green)]">•</span>
                  Personalize the first line with something specific about their work or the company
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--green)]">•</span>
                  Keep it under 300 characters for LinkedIn — brevity gets replies
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--green)]">•</span>
                  Send on Tuesday-Thursday morning for highest response rates
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {showUpgrade && (
        <div className="fixed inset-0 bg-[var(--ink)]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[8px_8px_0_rgba(22,33,61,0.12)] max-w-md w-full p-8 relative">
            <button onClick={() => setShowUpgrade(false)} className="absolute top-4 right-4 p-1 hover:bg-[var(--coral-light)] rounded-full transition-colors">
              <X className="w-5 h-5 text-[var(--ink-soft)]" />
            </button>
            <div className="w-16 h-16 bg-[var(--line)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[var(--ink)]" />
            </div>
            <h3 className="text-2xl font-serif font-[500] text-center text-[var(--ink)] mb-3">Pro Feature</h3>
            <p className="text-[var(--ink-soft)] text-center mb-6">Cold outreach writer is a Pro feature. Upgrade to generate personalized LinkedIn DMs and emails that reference your specific resume strengths.</p>
            <button onClick={() => router.push("/pricing")} className="w-full font-mono text-[14px] font-medium bg-[var(--coral)] text-white py-[15px] rounded-[3px] shadow-[3px_3px_0_var(--coral-dark)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all mb-3 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" /> Upgrade to Pro — $19/month
            </button>
            <button onClick={() => setShowUpgrade(false)} className="w-full text-[var(--ink-soft)] hover:text-[var(--ink)] py-2 font-medium transition-colors">Maybe Later</button>
          </div>
        </div>
      )}
    </div>
  );
}

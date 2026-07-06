"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ScoreCard from "@/components/ScoreCard";
import ImprovementList from "@/components/ImprovementList";
import BulletRewriter from "@/components/BulletRewriter";
import KeywordGapReport from "@/components/KeywordGapReport";
import VersionHistory from "@/components/VersionHistory";
import {
  RotateCcw, ArrowUp, Download, Share2,
  CheckCircle, AlertTriangle, FileText, Sparkles,
  FileEdit, Copy, Loader2, X, Eye, PenLine, Lock, WandSparkles, MessageSquare
} from "lucide-react";

const PRO_KEY = "resumeqo_pro";

function isPro() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PRO_KEY) === "true";
}

function getScoreColor(score) {
  if (score <= 40) return "#ef4444";
  if (score <= 60) return "#f97316";
  if (score <= 80) return "#eab308";
  return "#22c55e";
}

function getScoreLabel(score) {
  if (score <= 40) return "Needs Major Work";
  if (score <= 60) return "Below Average";
  if (score <= 80) return "Good — Room to Improve";
  return "Excellent!";
}

export default function ResultsPage() {
  const router = useRouter();
  const [pro, setPro] = useState(false);
  const [allResults, setAllResults] = useState([]);
  const [activeRole, setActiveRole] = useState(0);
  const [animatedScores, setAnimatedScores] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [coverLoading, setCoverLoading] = useState(false);
  const [coverCopied, setCoverCopied] = useState(false);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [beforeResults, setBeforeResults] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  useEffect(() => {
    setPro(isPro());
    const stored = sessionStorage.getItem("resumeResults");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setAllResults(parsed);
        } else {
          setAllResults([parsed]);
        }
      } catch (e) { console.error(e); }
    }

    const before = sessionStorage.getItem("resumeqo_before_results");
    if (before) {
      try { setBeforeResults(JSON.parse(before)); } catch (e) {} // eslint-disable-line no-empty
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const results = allResults[activeRole];
    if (!results) return;
    const cats = ["overallScore","formatting","content","keywords","experience","education","atsScore"];
    const durations = [1500,1000,1000,1000,1000,1000,1000];
    const delays = [0,300,400,500,600,700,800];
    setAnimatedScores({});
    cats.forEach((key, i) => {
      let target = key === "overallScore" ? results.overallScore || 0
        : key === "atsScore" ? results.atsScore || 0
        : results.scoreBreakdown?.[key] || 0;
      setTimeout(() => {
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / durations[i], 1);
          const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
          setAnimatedScores(prev => ({ ...prev, [key]: v }));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, delays[i]);
    });
  }, [activeRole, allResults]);

  const handleExport = () => {
    const results = allResults[activeRole];
    if (!results) return;
    setExporting(true);
    const label = getScoreLabel(results.overallScore || 0);
    const content = `
=== RESUME REVIEW REPORT ===
Score: ${results.overallScore || 0}/100 (${label})
Date: ${new Date().toLocaleDateString()}

=== SCORE BREAKDOWN ===
${Object.entries(results.scoreBreakdown || {}).map(([k, v]) => `  ${k}: ${v}/100`).join("\n")}

=== IMPROVEMENTS ===
${(results.improvements || []).map((imp, i) =>
  `  ${i + 1}. [${imp.section}] ${imp.issue}\n     Fix: ${imp.fix}`
).join("\n")}

=== MISSING KEYWORDS ===
  ${(results.missingKeywords || []).map(k => typeof k === "string" ? k : k.keyword).join(", ")}

=== ATS SCORE ===
  ${results.atsScore || 0}/100
${(results.atsIssues || []).map(i => `  ⚠ ${i}`).join("\n")}

=== TOP SUGGESTION ===
  ${results.topSuggestion || "N/A"}
    `.trim();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-review-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const handleGenerateCoverLetter = async () => {
    if (!isPro()) {
      setUpgradeMessage("Cover letter generation is a Pro feature. Upgrade to generate tailored cover letters from your resume and job descriptions.");
      setShowUpgrade(true);
      return;
    }
    setCoverLoading(true);
    setShowCoverLetter(true);
    setCoverLetter("");
    try {
      const resumeText = sessionStorage.getItem("resumeqo_resume_text") || "";
      const jobTitle = sessionStorage.getItem("resumeqo_job_title") || "";
      const jobDescription = sessionStorage.getItem("resumeqo_job_desc") || "";
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobTitle, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      setCoverLetter(data.letter);
    } catch (err) {
      setCoverLetter(`Error: ${err.message}`);
    } finally {
      setCoverLoading(false);
    }
  };

  const handleCopyCover = () => {
    navigator.clipboard.writeText(coverLetter);
    setCoverCopied(true);
    setTimeout(() => setCoverCopied(false), 2000);
  };

  const handleRestoreVersion = (versionResults) => {
    setAllResults([versionResults]);
    setActiveRole(0);
  };

  if (isLoading) return (
    <div className="relative z-[1] min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--ink)] border-t-transparent"></div>
    </div>
  );

  const results = allResults[activeRole];

  if (!results) return (
    <div className="relative z-[1] min-h-screen flex items-center justify-center px-8">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-12 h-12 text-[var(--coral)] mx-auto mb-4" />
        <h2 className="font-serif font-[500] text-2xl text-[var(--ink)] mb-3">No Results Found</h2>
        <p className="text-[var(--ink-soft)] mb-6">Analyze a resume to see results here.</p>
        <button onClick={() => router.push("/review")} className="font-mono text-[14px] font-medium bg-[var(--coral)] text-white px-[26px] py-[15px] rounded-[3px] shadow-[3px_3px_0_var(--coral-dark)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
          Analyze a Resume →
        </button>
      </div>
    </div>
  );

  const {
    overallScore = 0, scoreBreakdown = {}, strongPoints = [],
    improvements = [], missingKeywords = [], atsScore = 0,
    atsIssues = [], topSuggestion = "", bullets = [],
    keywordGap, industryBenchmark
  } = results;

  const cats = [
    { key: "formatting", label: "Formatting" },
    { key: "content", label: "Content" },
    { key: "keywords", label: "Keywords" },
    { key: "experience", label: "Experience" },
    { key: "education", label: "Education" },
  ];

  const difference = beforeResults ? overallScore - (beforeResults.overallScore || 0) : null;

  return (
    <div className="relative z-[1] min-h-screen py-12 px-8">
      <div className="max-w-[720px] mx-auto">
        <div className="text-center mb-10">
          <div className={`font-mono text-[12px] tracking-[0.06em] uppercase flex items-center justify-center gap-2 mb-4 ${pro ? "text-[var(--green)]" : "text-[var(--ink-soft)]"}`}>
            <span className={`w-[6px] h-[6px] rounded-full animate-pulse-dot ${pro ? "bg-[var(--green)]" : "bg-[var(--coral)]"}`}></span>
            {pro ? "Pro mode" : "Free review"}
            {!pro && (
              <button onClick={() => { localStorage.setItem(PRO_KEY, "true"); window.location.reload(); }} className="font-mono text-[10px] text-[var(--coral)] hover:text-[var(--coral-dark)] underline ml-1">
                Enable Pro (dev)
              </button>
            )}
          </div>
          <h1 className="font-serif font-[500] text-[clamp(28px,3vw,36px)] text-[var(--ink)]">
            Your Results
          </h1>
          {industryBenchmark && (
            <p className="font-mono text-[12px] text-[var(--ink-soft)] mt-2">
              Top {industryBenchmark.percentile}% for {industryBenchmark.role} resumes
              · Avg: {industryBenchmark.averageScore}
            </p>
          )}
        </div>

        {allResults.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {allResults.map((r, i) => (
              <button
                key={i}
                onClick={() => setActiveRole(i)}
                className={`font-mono text-[12px] px-4 py-2 rounded-[3px] transition-all ${
                  activeRole === i
                    ? "bg-[var(--ink)] text-white"
                    : "bg-[var(--line)] text-[var(--ink-soft)] hover:bg-[var(--coral-light)]"
                }`}
              >
                {r.roleName || `Role ${i + 1}`} — {r.overallScore || 0}
              </button>
            ))}
          </div>
        )}

        <div className="mb-8">
          <ScoreCard score={animatedScores.overallScore || 0} />
        </div>

        {difference !== null && showBeforeAfter && (
          <div className={`mb-6 p-6 rounded-[3px] border text-center ${
            difference >= 0 ? "bg-[var(--green-light)] border-[var(--green)]" : "bg-[var(--coral-light)] border-[var(--coral)]"
          }`}>
            <h3 className="font-serif font-[500] text-[18px] mb-2">Before vs After</h3>
            <div className="flex items-center justify-center gap-6 font-mono text-sm">
              <div>
                <span className="text-[var(--ink-soft)]">Before:</span>{" "}
                <span className="font-semibold">{beforeResults?.overallScore || 0}</span>
              </div>
              <ArrowUp className={`w-5 h-5 ${difference >= 0 ? "text-[var(--green)]" : "text-[var(--coral)]"}`} />
              <div>
                <span className="text-[var(--ink-soft)]">After:</span>{" "}
                <span className="font-semibold">{overallScore}</span>
              </div>
              <div className={`font-semibold ${difference >= 0 ? "text-[var(--green)]" : "text-[var(--coral)]"}`}>
                {difference >= 0 ? "+" : ""}{difference} pts
              </div>
            </div>
          </div>
        )}

        {pro ? (
          <VersionHistory currentScore={overallScore} currentResults={results} onRestoreVersion={handleRestoreVersion} />
        ) : (
          <div className="bg-[var(--paper-card)] border border-[var(--line)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-8 mb-6 opacity-60 relative">
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--paper-card)]/40 backdrop-blur-[1px] z-10">
              <button
                onClick={() => { setUpgradeMessage("Score history tracking is a Pro feature. Track your improvement over time with version history."); setShowUpgrade(true); }}
                className="font-mono text-[12px] bg-[var(--ink)] text-white px-5 py-3 rounded-[3px] hover:bg-[var(--coral)] transition-all flex items-center gap-2"
              >
                <Lock className="w-4 h-4" /> Pro Feature — Upgrade to View
              </button>
            </div>
            <h3 className="font-serif font-[500] text-[18px] text-[var(--ink)] flex items-center gap-2">Score History</h3>
          </div>
        )}

        <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-8 mb-6">
          <h2 className="font-serif font-[500] text-[18px] text-[var(--ink)] mb-5">Score Breakdown</h2>
          <div className="space-y-4">
            {cats.map((cat) => {
              const s = scoreBreakdown[cat.key] || 0;
              const a = animatedScores[cat.key] || 0;
              return (
                <div key={cat.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--ink-soft)]">{cat.label}</span>
                    <span className="font-mono text-[13px] font-semibold" style={{ color: getScoreColor(s) }}>{a}/100</span>
                  </div>
                  <div className="w-full h-[6px] bg-[#ECE8DC] rounded-[3px] overflow-hidden">
                    <div className="h-full rounded-[3px] transition-all duration-1000" style={{ width: `${a}%`, background: getScoreColor(s) }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {strongPoints.length > 0 && (
          <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-8 mb-6">
            <h2 className="font-serif font-[500] text-[18px] text-[var(--ink)] mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[var(--green)]" /> Strong Points
            </h2>
            <div className="space-y-2">
              {strongPoints.map((p, i) => (
                <div key={i} className="flex items-start gap-3 bg-[var(--green-light)] rounded-[3px] p-3 text-sm">
                  <span className="text-[var(--green)]">✓</span>
                  <span className="text-[var(--ink)]">{p}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {improvements.length > 0 && (
          <div className="mb-6">
            <ImprovementList improvements={improvements} />
          </div>
        )}

        {bullets.length > 0 && (
          pro ? (
            <BulletRewriter bullets={bullets} resumeText={typeof window !== "undefined" ? sessionStorage.getItem("resumeqo_resume_text") || "" : ""} />
          ) : (
            <div className="bg-[var(--paper-card)] border border-[var(--line)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-8 mb-6 opacity-60 relative">
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--paper-card)]/40 backdrop-blur-[1px] z-10">
                <button
                  onClick={() => { setUpgradeMessage("AI bullet rewriter is a Pro feature. Get tailored rewrites for every bullet point on your resume."); setShowUpgrade(true); }}
                  className="font-mono text-[12px] bg-[var(--ink)] text-white px-5 py-3 rounded-[3px] hover:bg-[var(--coral)] transition-all flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Pro Feature — Upgrade to Use
                </button>
              </div>
              <h3 className="font-serif font-[500] text-[18px] text-[var(--ink)] flex items-center gap-2">Bullet Point Rewriter</h3>
            </div>
          )
        )}

        <KeywordGapReport missingKeywords={missingKeywords} keywordGap={keywordGap} />

        <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-8 mb-6">
          <h2 className="font-serif font-[500] text-[18px] text-[var(--ink)] mb-4">
            ATS Score: <span style={{ color: getScoreColor(atsScore) }}>{animatedScores.atsScore || 0}/100</span>
          </h2>
          <div className="w-full h-[6px] bg-[#ECE8DC] rounded-[3px] mb-4 overflow-hidden">
            <div className="h-full rounded-[3px] transition-all duration-1000" style={{ width: `${animatedScores.atsScore || 0}%`, background: getScoreColor(atsScore) }}></div>
          </div>
          {atsIssues.length > 0 && (
            <>
              <p className="font-mono text-[12px] text-[var(--ink-soft)] mb-3">Your resume may not pass ATS systems because:</p>
              {atsIssues.map((issue, i) => (
                <div key={i} className="flex items-start gap-2 bg-[var(--coral-light)] rounded-[3px] p-3 text-sm text-[var(--coral-dark)] mb-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{issue}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {topSuggestion && (
          <div className="bg-[var(--green-light)] border border-[var(--green)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-8 mb-6">
            <h2 className="font-serif font-[500] text-[18px] text-[var(--green)] mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Top Tip
            </h2>
            <p className="text-[var(--ink)]">{topSuggestion}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button onClick={() => router.push("/review")} className="flex-1 font-mono text-[14px] font-medium bg-[var(--coral)] text-white py-[15px] rounded-[3px] shadow-[3px_3px_0_var(--coral-dark)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2">
            <RotateCcw className="w-5 h-5" /> Review Another
          </button>
          <button onClick={() => router.push("/pricing")} className="flex-1 font-mono text-[14px] font-medium bg-[var(--ink)] text-white py-[15px] rounded-[3px] shadow-[3px_3px_0_rgba(22,33,61,0.3)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2">
            <ArrowUp className="w-5 h-5" /> Upgrade
          </button>
          <button
            onClick={() => {
              if (!isPro()) {
                setUpgradeMessage("AI resume tailoring is a Pro feature. Get a complete resume rewrite optimized for any job description.");
                setShowUpgrade(true);
                return;
              }
              router.push("/tailor");
            }}
            className="font-mono text-[14px] font-medium bg-[var(--green-light)] text-[var(--green)] border border-[var(--green)] py-[15px] px-6 rounded-[3px] hover:bg-[var(--green)] hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <WandSparkles className="w-5 h-5" /> Tailor for Job
          </button>
          <button
            onClick={() => {
              if (!isPro()) {
                setUpgradeMessage("Cold outreach writer is a Pro feature. Get personalized LinkedIn DMs and emails tailored to specific companies.");
                setShowUpgrade(true);
                return;
              }
              router.push("/outreach");
            }}
            className="font-mono text-[14px] font-medium bg-[var(--paper-card)] text-[var(--ink)] border border-[var(--line)] py-[15px] px-6 rounded-[3px] hover:bg-[var(--line)] transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-5 h-5" /> Cold Outreach
          </button>
          <button onClick={handleGenerateCoverLetter} className="font-mono text-[14px] font-medium bg-[var(--paper-card)] text-[var(--ink)] border border-[var(--line)] py-[15px] px-6 rounded-[3px] hover:bg-[var(--line)] transition-all flex items-center justify-center gap-2">
            <PenLine className="w-5 h-5" /> Cover Letter
          </button>
          <button onClick={handleExport} disabled={exporting} className="font-mono text-[14px] font-medium bg-[var(--paper-card)] text-[var(--ink)] border border-[var(--line)] py-[15px] px-6 rounded-[3px] hover:bg-[var(--line)] transition-all flex items-center justify-center gap-2">
            <FileText className="w-5 h-5" /> {exporting ? "Exporting..." : "Export"}
          </button>
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Link copied!"); }} className="font-mono text-[14px] font-medium bg-[var(--paper-card)] text-[var(--ink)] border border-[var(--line)] py-[15px] px-6 rounded-[3px] hover:bg-[var(--line)] transition-all flex items-center justify-center gap-2">
            <Share2 className="w-5 h-5" /> Share
          </button>
        </div>

        {beforeResults && (
          <div className="mt-4">
            <button
              onClick={() => {
                if (!isPro()) {
                  setUpgradeMessage("Before/after comparison is a Pro feature. See how your resume score improves after applying our suggestions.");
                  setShowUpgrade(true);
                  return;
                }
                setShowBeforeAfter(!showBeforeAfter);
              }}
              className={`w-full font-mono text-[13px] py-3 rounded-[3px] transition-all flex items-center justify-center gap-2 ${
                showBeforeAfter
                  ? "bg-[var(--line)] text-[var(--ink-soft)]"
                  : "bg-[var(--paper-card)] border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--line)]"
              }`}
            >
              <Eye className="w-4 h-4" /> {showBeforeAfter ? "Hide" : "Show"} Before/After Comparison
              {!pro && <Lock className="w-3 h-3 text-[var(--coral)]" />}
            </button>
          </div>
        )}
      </div>

      {showCoverLetter && (
        <div className="fixed inset-0 bg-[var(--ink)]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[8px_8px_0_rgba(22,33,61,0.12)] max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[var(--line)]">
              <h3 className="font-serif font-[500] text-[18px] text-[var(--ink)] flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-[var(--coral)]" /> Cover Letter
              </h3>
              <button onClick={() => setShowCoverLetter(false)} className="p-1 hover:bg-[var(--coral-light)] rounded-full transition-colors">
                <X className="w-5 h-5 text-[var(--ink-soft)]" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {coverLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--coral)] mx-auto mb-4" />
                  <p className="text-sm text-[var(--ink-soft)]">Writing your cover letter...</p>
                </div>
              ) : coverLetter.startsWith("Error:") ? (
                <div className="bg-[var(--coral-light)] border border-[var(--coral)] rounded-[3px] p-4 text-sm text-[var(--coral-dark)]">{coverLetter}</div>
              ) : (
                <div className="whitespace-pre-wrap text-sm text-[var(--ink)] leading-relaxed font-sans">{coverLetter}</div>
              )}
            </div>
            {coverLetter && !coverLetter.startsWith("Error:") && (
              <div className="border-t border-[var(--line)] p-4 flex justify-end gap-3">
                <button onClick={handleCopyCover} className="font-mono text-[12px] bg-[var(--ink)] text-white px-6 py-2.5 rounded-[3px] hover:bg-[var(--coral)] transition-all flex items-center gap-2">
                  {coverCopied ? <><CheckCircle className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy to Clipboard</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
            <p className="text-[var(--ink-soft)] text-center mb-6">{upgradeMessage}</p>
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

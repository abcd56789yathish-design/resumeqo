"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ScoreCard from "@/components/ScoreCard";
import ImprovementList from "@/components/ImprovementList";
import BulletRewriter from "@/components/BulletRewriter";
import KeywordGapReport from "@/components/KeywordGapReport";
import VersionHistory from "@/components/VersionHistory";
import RecruiterHeatmap from "@/components/RecruiterHeatmap";
import {
  RotateCcw, ArrowUp, Download, Share2,
  CheckCircle, AlertTriangle, FileText, Sparkles
} from "lucide-react";

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
  const [results, setResults] = useState(null);
  const [animatedScores, setAnimatedScores] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("resumeResults");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setResults(parsed);
        const cats = ["overallScore","formatting","content","keywords","experience","education","atsScore"];
        const durations = [1500,1000,1000,1000,1000,1000,1000];
        const delays = [0,300,400,500,600,700,800];
        cats.forEach((key, i) => {
          let target = key === "overallScore" ? parsed.overallScore || 0
            : key === "atsScore" ? parsed.atsScore || 0
            : parsed.scoreBreakdown?.[key] || 0;
          setTimeout(() => {
            const start = performance.now();
            const step = (now) => {
              const p = Math.min((now - start) / durations[i], 1);
              const v = Math.round(0 + (target - 0) * (1 - Math.pow(1 - p, 3)));
              setAnimatedScores(prev => ({ ...prev, [key]: v }));
              if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          }, delays[i]);
        });
      } catch (e) { console.error(e); }
    }
    setIsLoading(false);
  }, []);

  const handleExport = () => {
    setExporting(true);
    const score = results?.overallScore || 0;
    const label = getScoreLabel(score);
    const content = `
=== RESUME REVIEW REPORT ===
Score: ${score}/100 (${label})
Date: ${new Date().toLocaleDateString()}

=== SCORE BREAKDOWN ===
${Object.entries(results?.scoreBreakdown || {}).map(([k, v]) => `  ${k}: ${v}/100`).join("\n")}

=== IMPROVEMENTS ===
${(results?.improvements || []).map((imp, i) =>
  `  ${i + 1}. [${imp.section}] ${imp.issue}\n     Fix: ${imp.fix}`
).join("\n")}

=== MISSING KEYWORDS ===
  ${(results?.missingKeywords || []).map(k => typeof k === "string" ? k : k.keyword).join(", ")}

=== ATS SCORE ===
  ${results?.atsScore || 0}/100
${(results?.atsIssues || []).map(i => `  ⚠ ${i}`).join("\n")}

=== TOP SUGGESTION ===
  ${results?.topSuggestion || "N/A"}
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

  if (isLoading) return (
    <div className="relative z-[1] min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--ink)] border-t-transparent"></div>
    </div>
  );

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
    keywordGap, recruiterNotes = [], industryBenchmark
  } = results;

  const cats = [
    { key: "formatting", label: "Formatting" },
    { key: "content", label: "Content" },
    { key: "keywords", label: "Keywords" },
    { key: "experience", label: "Experience" },
    { key: "education", label: "Education" },
  ];

  return (
    <div className="relative z-[1] min-h-screen py-12 px-8">
      <div className="max-w-[720px] mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-serif font-[500] text-[clamp(28px,3vw,36px)] text-[var(--ink)]">
            🤖 Resumeqo — Your Results
          </h1>
          {industryBenchmark && (
            <p className="font-mono text-[12px] text-[var(--ink-soft)] mt-2">
              Top {industryBenchmark.percentile}% for {industryBenchmark.role} resumes
              · Avg: {industryBenchmark.averageScore}
            </p>
          )}
        </div>

        <div className="mb-8">
          <ScoreCard score={animatedScores.overallScore || 0} />
        </div>

        <VersionHistory currentScore={overallScore} />

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
          <BulletRewriter bullets={bullets} />
        )}

        <KeywordGapReport missingKeywords={missingKeywords} keywordGap={keywordGap} />

        <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-8 mb-6">
          <h2 className="font-serif font-[500] text-[18px] text-[var(--ink)] mb-4">
            🤖 ATS Score: <span style={{ color: getScoreColor(atsScore) }}>{animatedScores.atsScore || 0}/100</span>
          </h2>
          <div className="w-full h-[6px] bg-[#ECE8DC] rounded-[3px] mb-4 overflow-hidden">
            <div className="h-full rounded-[3px] transition-all duration-1000" style={{ width: `${animatedScores.atsScore || 0}%`, background: getScoreColor(atsScore) }}></div>
          </div>
          {atsIssues.length > 0 && (
            <>
              <p className="font-mono text-[12px] text-[var(--ink-soft)] mb-3">⚠️ Your resume may not pass ATS systems because:</p>
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

        <RecruiterHeatmap recruiterNotes={recruiterNotes} />

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={() => router.push("/review")}
            className="flex-1 font-mono text-[14px] font-medium bg-[var(--coral)] text-white py-[15px] rounded-[3px] shadow-[3px_3px_0_var(--coral-dark)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" /> Review Another
          </button>
          <button
            onClick={() => router.push("/pricing")}
            className="flex-1 font-mono text-[14px] font-medium bg-[var(--ink)] text-white py-[15px] rounded-[3px] shadow-[3px_3px_0_rgba(22,33,61,0.3)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2"
          >
            <ArrowUp className="w-5 h-5" /> Upgrade
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="font-mono text-[14px] font-medium bg-[var(--paper-card)] text-[var(--ink)] border border-[var(--line)] py-[15px] px-6 rounded-[3px] hover:bg-[var(--line)] transition-all flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" /> {exporting ? "Exporting..." : "Export Report"}
          </button>
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Copied!"); }}
            className="font-mono text-[14px] font-medium bg-[var(--paper-card)] text-[var(--ink)] border border-[var(--line)] py-[15px] px-6 rounded-[3px] hover:bg-[var(--line)] transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" /> Share
          </button>
        </div>
      </div>
    </div>
  );
}

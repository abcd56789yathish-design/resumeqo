"use client";

import { AlertTriangle, CheckCircle, Info } from "lucide-react";

function getImportanceColor(level) {
  switch (level) {
    case "high": return "var(--coral)";
    case "medium": return "var(--coral-dark)";
    default: return "var(--ink-soft)";
  }
}

export default function KeywordGapReport({ missingKeywords = [], keywordGap }) {
  const gap = keywordGap || {};
  const missing = gap.missingFromResume || [];
  const present = gap.presentInResume || [];

  if (!missing.length && !present.length && !missingKeywords.length) return null;

  const hasJDData = gap.fromJD;

  return (
    <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-8 mb-6">
      <h3 className="font-serif font-[500] text-[18px] text-[var(--ink)] mb-4 flex items-center gap-2">
        <Info className="w-5 h-5 text-[var(--coral)]" /> Keyword Gap Report
        {hasJDData && (
          <span className="font-mono text-[10px] bg-[var(--green-light)] text-[var(--green)] border border-[var(--green)] px-2 py-0.5 rounded-[2px]">
            JD Analysis
          </span>
        )}
      </h3>

      {missing.length > 0 && (
        <div className="mb-4">
          <p className="font-mono text-[12px] text-[var(--coral-dark)] uppercase tracking-[0.06em] mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Missing from Resume
          </p>
          <div className="space-y-2">
            {missing.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-[var(--coral-light)] rounded-[3px] p-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[13px] text-[var(--ink)]">{item.keyword}</span>
                  <span
                    className="font-mono text-[9px] px-1.5 py-0.5 rounded-[2px] text-white"
                    style={{ backgroundColor: getImportanceColor(item.importance) }}
                  >
                    {item.importance}
                  </span>
                </div>
                {item.mentionedInJD > 0 && (
                  <span className="font-mono text-[11px] text-[var(--ink-soft)]">
                    ×{item.mentionedInJD} in JD
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {present.length > 0 && (
        <div className="mb-4">
          <p className="font-mono text-[12px] text-[var(--green)] uppercase tracking-[0.06em] mb-3 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> Matched Keywords
          </p>
          <div className="flex flex-wrap gap-2">
            {present.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-[var(--green-light)] rounded-[3px] px-3 py-1.5">
                <span className="font-mono text-[12px] text-[var(--green)]">{item.keyword}</span>
                {item.mentionedInJD > 0 && (
                  <span className="font-mono text-[10px] text-[var(--ink-soft)]">×{item.mentionedInJD}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasJDData && missingKeywords.length > 0 && (
        <div>
          <p className="font-mono text-[12px] text-[var(--coral-dark)] uppercase tracking-[0.06em] mb-3">
            Suggested Keywords to Add
          </p>
          <div className="flex flex-wrap gap-2">
            {missingKeywords.map((item, i) => {
              const kw = typeof item === "string" ? { keyword: item, importance: "medium" } : item;
              return (
                <span
                  key={i}
                  className="font-mono text-[11px] bg-[var(--coral-light)] text-[var(--coral-dark)] border border-[var(--coral)] px-2.5 py-1 rounded-[2px]"
                >
                  {kw.keyword}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import SuggestionCard from "./SuggestionCard";

export default function ImprovementList({ improvements = [] }) {
  const [appliedFixes, setAppliedFixes] = useState([]);

  if (!improvements.length) return null;

  const handleApply = (improvement, rewrite) => {
    setAppliedFixes((prev) => [
      ...prev,
      {
        section: improvement.section,
        original: improvement.originalText,
        rewritten: rewrite,
        timestamp: Date.now(),
      },
    ]);
  };

  const clearApplied = () => setAppliedFixes([]);

  return (
    <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-6 sm:p-8 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif font-[500] text-[18px] text-[var(--ink)] flex items-center gap-2">
          <span className="text-[var(--coral)]">✎</span> Line-by-Line Fixes
        </h3>
        {appliedFixes.length > 0 && (
          <button
            onClick={clearApplied}
            className="font-mono text-[11px] text-[var(--coral-dark)] hover:text-[var(--coral)] transition-colors"
          >
            Clear ({appliedFixes.length}) applied
          </button>
        )}
      </div>

      {appliedFixes.length > 0 && (
        <div className="mb-4 p-3 bg-[var(--green-light)] border border-[var(--green)] rounded-[3px]">
          <p className="font-mono text-[11px] font-semibold text-[var(--green)] mb-2">
            ✅ {appliedFixes.length} fix{appliedFixes.length > 1 ? "es" : ""} applied
          </p>
          <div className="space-y-1">
            {appliedFixes.map((fix, i) => (
              <p key={i} className="text-xs text-[var(--ink)]">
                <span className="text-[var(--ink-soft)]">{fix.section}:</span> &ldquo;{fix.rewritten}&rdquo;
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {improvements.map((item, i) => (
          <SuggestionCard key={i} improvement={item} onApply={handleApply} />
        ))}
      </div>
    </div>
  );
}

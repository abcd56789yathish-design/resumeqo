"use client";

import { useState } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";

export default function SuggestionCard({ improvement, onApply }) {
  const [selectedTone, setSelectedTone] = useState("quantified");
  const [applied, setApplied] = useState(false);
  const [copied, setCopied] = useState(false);

  const tones = [
    { key: "concise", label: "Concise" },
    { key: "quantified", label: "Quantified" },
    { key: "senior", label: "Senior" },
  ];

  const currentRewrite = improvement.rewrites?.[selectedTone];

  const handleApply = () => {
    if (currentRewrite) {
      onApply?.(improvement, currentRewrite);
      setApplied(true);
      setTimeout(() => setApplied(false), 2000);
    }
  };

  const handleCopy = () => {
    if (currentRewrite) {
      navigator.clipboard.writeText(currentRewrite);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="border-l-4 border-[var(--coral)] bg-[var(--coral-light)] rounded-r-[3px] p-4 mb-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="font-mono text-[11px] font-semibold text-[var(--coral-dark)] uppercase tracking-[0.06em]">
            {improvement.section}
          </p>
          {improvement.originalText && (
            <p className="text-[var(--ink-soft)] text-xs mt-1 line-through">
              {improvement.originalText}
            </p>
          )}
        </div>
        {improvement.metricPrompt && (
          <span className="font-mono text-[10px] bg-[var(--coral)] text-white px-2 py-0.5 rounded-[2px] shrink-0">
            Needs Metrics
          </span>
        )}
      </div>

      <p className="text-[var(--coral-dark)] text-sm mb-1">
        <span className="font-medium">Issue:</span> {improvement.issue}
      </p>

      {currentRewrite && (
        <div className="mt-3">
          <div className="flex gap-1 mb-2">
            {tones.map((tone) => (
              <button
                key={tone.key}
                onClick={() => setSelectedTone(tone.key)}
                className={`font-mono text-[11px] px-2.5 py-1 rounded-[2px] transition-all ${
                  selectedTone === tone.key
                    ? "bg-[var(--ink)] text-white"
                    : "bg-white text-[var(--ink-soft)] border border-[var(--line)] hover:border-[var(--ink)]"
                }`}
              >
                {tone.label}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-[3px] p-3 border border-[var(--line)]">
            <p className="text-sm text-[var(--ink)]">{currentRewrite}</p>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleApply}
              className={`flex items-center gap-1.5 font-mono text-[11px] px-3 py-1.5 rounded-[2px] transition-all ${
                applied
                  ? "bg-[var(--green)] text-white"
                  : "bg-[var(--ink)] text-white hover:bg-[var(--coral)]"
              }`}
            >
              {applied ? (
                <><Check className="w-3.5 h-3.5" /> Applied</>
              ) : (
                <><Check className="w-3.5 h-3.5" /> Apply Fix</>
              )}
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 font-mono text-[11px] px-3 py-1.5 rounded-[2px] bg-white border border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink)] transition-all"
            >
              {copied ? (
                <><Copy className="w-3.5 h-3.5" /> Copied</>
              ) : (
                <><Copy className="w-3.5 h-3.5" /> Copy</>
              )}
            </button>
          </div>
        </div>
      )}

      {improvement.metricPrompt && (
        <div className="mt-3 bg-white rounded-[3px] p-3 border border-[var(--coral)]">
          <p className="font-mono text-[10px] text-[var(--coral-dark)] uppercase mb-1 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Missing Metrics
          </p>
          <p className="text-sm text-[var(--ink)]">{improvement.metricPrompt}</p>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Type your answer..."
              className="flex-1 px-3 py-1.5 text-sm border border-[var(--line)] rounded-[2px] focus:outline-none focus:border-[var(--ink)] bg-transparent"
            />
            <button className="font-mono text-[11px] bg-[var(--coral)] text-white px-3 py-1.5 rounded-[2px] hover:bg-[var(--coral-dark)] transition-all">
              Generate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

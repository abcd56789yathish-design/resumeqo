"use client";

import { useState } from "react";
import { Sparkles, Check, Copy, Loader2, Wand2 } from "lucide-react";

const TONES = [
  { key: "concise", label: "Concise", desc: "Short & direct" },
  { key: "quantified", label: "Quantified", desc: "Add numbers" },
  { key: "senior", label: "Senior", desc: "Leadership tone" },
];

export default function BulletRewriter({ bullets = [], resumeText = "" }) {
  const [selectedBullet, setSelectedBullet] = useState(0);
  const [selectedTone, setSelectedTone] = useState("quantified");
  const [applied, setApplied] = useState({});
  const [copied, setCopied] = useState({});
  const [rewrites, setRewrites] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState("");

  if (!bullets.length) return null;

  const bullet = bullets[selectedBullet];
  const cachedRewrite = rewrites[`${selectedBullet}-${selectedTone}`];
  const isLoading = loading[`${selectedBullet}-${selectedTone}`];

  const fetchRewrite = async (tone) => {
    const key = `${selectedBullet}-${tone}`;
    if (rewrites[key]) {
      setSelectedTone(tone);
      return;
    }
    setLoading((prev) => ({ ...prev, [key]: true }));
    setError("");
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: bullet.text,
          section: bullet.section,
          tone,
          context: resumeText.substring(0, 2000),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to rewrite");
      setRewrites((prev) => ({ ...prev, [key]: data.rewrite }));
      setSelectedTone(tone);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleCopy = () => {
    const current = rewrites[`${selectedBullet}-${selectedTone}`] || bullet.rewrites?.[selectedTone];
    if (!current) return;
    navigator.clipboard.writeText(current);
    const key = `${selectedBullet}-${selectedTone}`;
    setCopied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [key]: false })), 2000);
  };

  const handleApply = () => {
    const current = rewrites[`${selectedBullet}-${selectedTone}`] || bullet.rewrites?.[selectedTone];
    if (!current) return;
    navigator.clipboard.writeText(current);
    const key = `${selectedBullet}-${selectedTone}`;
    setApplied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setApplied((prev) => ({ ...prev, [key]: false })), 2000);
  };

  const getCurrentRewrite = () => rewrites[`${selectedBullet}-${selectedTone}`] || bullet.rewrites?.[selectedTone];

  return (
    <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-6 sm:p-8 mb-6">
      <h3 className="font-serif font-[500] text-[18px] text-[var(--ink)] mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-[var(--coral)]" /> Bullet Point Rewriter
      </h3>

      {bullets.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {bullets.map((b, i) => (
            <button
              key={i}
              onClick={() => { setSelectedBullet(i); setError(""); }}
              className={`font-mono text-[11px] px-3 py-1.5 rounded-[2px] transition-all ${
                selectedBullet === i
                  ? "bg-[var(--ink)] text-white"
                  : "bg-[var(--line)] text-[var(--ink-soft)] hover:bg-[var(--coral-light)]"
              }`}
            >
              {b.section} #{i + 1}
            </button>
          ))}
        </div>
      )}

      <div className="bg-[var(--coral-light)] rounded-[3px] p-4 mb-4">
        <p className="font-mono text-[10px] text-[var(--coral-dark)] uppercase mb-1">Original</p>
        <p className="text-sm text-[var(--ink)]">{bullet.text}</p>
        {bullet.metricPrompt && (
          <p className="text-xs text-[var(--coral-dark)] mt-2 flex items-center gap-1">
            <span className="font-medium">Tip:</span> {bullet.metricPrompt}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        {TONES.map((tone) => {
          const key = `${selectedBullet}-${tone.key}`;
          const isCurrentLoading = loading[key];
          return (
            <button
              key={tone.key}
              onClick={() => {
                if (isCurrentLoading) return;
                if (tone.key !== selectedTone) {
                  fetchRewrite(tone.key);
                }
              }}
              className={`flex-1 font-mono text-[11px] px-3 py-2 rounded-[2px] text-center transition-all ${
                isCurrentLoading
                  ? "bg-[var(--line)] text-[var(--ink-soft)] cursor-wait"
                  : selectedTone === tone.key
                  ? "bg-[var(--ink)] text-white"
                  : "bg-white border border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink)]"
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                {isCurrentLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                {tone.label}
              </div>
              <div className="text-[9px] opacity-60">{tone.desc}</div>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="bg-[var(--coral-light)] border border-[var(--coral)] rounded-[3px] p-3 mb-4 text-sm text-[var(--coral-dark)]">
          {error}
        </div>
      )}

      {getCurrentRewrite() && (
        <div className="bg-[var(--green-light)] rounded-[3px] p-4 border border-[var(--green)] mb-4">
          <p className="font-mono text-[10px] text-[var(--green)] uppercase mb-1">Rewritten</p>
          <p className="text-sm text-[var(--ink)]">{getCurrentRewrite()}</p>
        </div>
      )}

      {!getCurrentRewrite() && !isLoading && (
        <div className="bg-white border border-dashed border-[var(--line)] rounded-[3px] p-4 mb-4 text-center">
          <p className="text-sm text-[var(--ink-soft)]">Select a tone above to generate an AI rewrite</p>
        </div>
      )}

      {isLoading && (
        <div className="bg-white border border-dashed border-[var(--line)] rounded-[3px] p-4 mb-4 text-center">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--coral)] mx-auto mb-2" />
          <p className="text-sm text-[var(--ink-soft)]">Rewriting with AI...</p>
        </div>
      )}

      {getCurrentRewrite() && (
        <div className="flex gap-2">
          <button
            onClick={handleApply}
            className="flex items-center gap-1.5 font-mono text-[12px] bg-[var(--ink)] text-white px-4 py-2 rounded-[2px] hover:bg-[var(--coral)] transition-all"
          >
            {applied[`${selectedBullet}-${selectedTone}`] ? (
              <><Check className="w-4 h-4" /> Copied!</>
            ) : (
              <><Wand2 className="w-4 h-4" /> Apply Fix</>
            )}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 font-mono text-[12px] bg-white border border-[var(--line)] text-[var(--ink-soft)] px-4 py-2 rounded-[2px] hover:border-[var(--ink)] transition-all"
          >
            {copied[`${selectedBullet}-${selectedTone}`] ? (
              <><Copy className="w-4 h-4" /> Copied</>
            ) : (
              <><Copy className="w-4 h-4" /> Copy</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Sparkles, Check, Copy } from "lucide-react";

const TONES = [
  { key: "concise", label: "Concise", desc: "Short & direct" },
  { key: "quantified", label: "Quantified", desc: "Add numbers" },
  { key: "senior", label: "Senior", desc: "Leadership tone" },
];

export default function BulletRewriter({ bullets = [] }) {
  const [selectedBullet, setSelectedBullet] = useState(0);
  const [selectedTone, setSelectedTone] = useState("quantified");
  const [applied, setApplied] = useState({});
  const [copied, setCopied] = useState({});
  const [customInput, setCustomInput] = useState("");

  if (!bullets.length) return null;

  const bullet = bullets[selectedBullet];
  const rewrite = bullet.rewrites?.[selectedTone];

  const handleApply = () => {
    if (!rewrite) return;
    const key = `${selectedBullet}-${selectedTone}`;
    setApplied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setApplied((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const handleCopy = () => {
    if (!rewrite) return;
    navigator.clipboard.writeText(rewrite);
    const key = `${selectedBullet}-${selectedTone}`;
    setCopied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  return (
    <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-8 mb-6">
      <h3 className="font-serif font-[500] text-[18px] text-[var(--ink)] mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-[var(--coral)]" /> Bullet Point Rewriter
      </h3>

      {bullets.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {bullets.map((b, i) => (
            <button
              key={i}
              onClick={() => { setSelectedBullet(i); setCustomInput(""); }}
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

      <div className="flex gap-2 mb-4">
        {TONES.map((tone) => (
          <button
            key={tone.key}
            onClick={() => setSelectedTone(tone.key)}
            className={`flex-1 font-mono text-[11px] px-3 py-2 rounded-[2px] text-center transition-all ${
              selectedTone === tone.key
                ? "bg-[var(--ink)] text-white"
                : "bg-white border border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink)]"
            }`}
          >
            <div>{tone.label}</div>
            <div className="text-[9px] opacity-60">{tone.desc}</div>
          </button>
        ))}
      </div>

      {rewrite && (
        <div className="bg-[var(--green-light)] rounded-[3px] p-4 border border-[var(--green)] mb-4">
          <p className="font-mono text-[10px] text-[var(--green)] uppercase mb-1">Rewritten</p>
          <p className="text-sm text-[var(--ink)]">{rewrite}</p>
        </div>
      )}

      {bullet.metricPrompt && (
        <div className="mt-4 p-4 bg-white border border-[var(--coral)] rounded-[3px]">
          <p className="font-mono text-[10px] text-[var(--coral-dark)] uppercase mb-2">
            {bullet.metricPrompt}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g., 30%, $500K, 1000 users..."
              className="flex-1 px-3 py-2 text-sm border border-[var(--line)] rounded-[2px] focus:outline-none focus:border-[var(--ink)] bg-transparent"
            />
            <button
              onClick={() => {
                if (customInput.trim()) {
                  alert(`Metric-backed bullet generated! Preview:\n${bullet.text.replace(/improve\w*/i, `increased ${customInput}`)}`);
                }
              }}
              className="font-mono text-[11px] bg-[var(--coral)] text-white px-4 py-2 rounded-[2px] hover:bg-[var(--coral-dark)] transition-all"
            >
              Generate
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleApply}
          className="flex items-center gap-1.5 font-mono text-[12px] bg-[var(--ink)] text-white px-4 py-2 rounded-[2px] hover:bg-[var(--coral)] transition-all"
        >
          {applied[`${selectedBullet}-${selectedTone}`] ? (
            <><Check className="w-4 h-4" /> Applied</>
          ) : (
            <><Check className="w-4 h-4" /> Apply Fix</>
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
    </div>
  );
}

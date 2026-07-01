"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Trash2, Clock } from "lucide-react";

const HISTORY_KEY = "resumeqo_score_history";

export default function VersionHistory({ currentScore }) {
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    if (currentScore > 0) {
      const entry = {
        score: currentScore,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setHistory((prev) => {
        const updated = [entry, ...prev].slice(0, 20);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [currentScore]);

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  const prevScore = history.length > 1 ? history[1].score : null;
  const change = prevScore ? currentScore - prevScore : null;

  if (!history.length) return null;

  return (
    <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-8 mb-6">
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="font-serif font-[500] text-[18px] text-[var(--ink)] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[var(--coral)]" /> Score History
        </h3>
        <span className="font-mono text-[12px] text-[var(--ink-soft)]">
          {showHistory ? "▲ Hide" : "▼ Show"}
        </span>
      </button>

      {change !== null && (
        <div className={`mt-3 font-mono text-[13px] px-3 py-2 rounded-[2px] ${
          change > 0
            ? "bg-[var(--green-light)] text-[var(--green)]"
            : change < 0
            ? "bg-[var(--coral-light)] text-[var(--coral-dark)]"
            : "bg-[var(--line)] text-[var(--ink-soft)]"
        }`}>
          {change > 0
            ? `↑ +${change} points from last review`
            : change < 0
            ? `↓ ${change} points from last review`
            : "Same score as last review"}
        </div>
      )}

      {showHistory && (
        <div className="mt-4">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {history.map((entry, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 px-3 bg-[var(--line)]/30 rounded-[2px]"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
                  <span className="font-mono text-[12px] text-[var(--ink-soft)]">
                    {entry.date} {i === 0 ? "· Now" : `· ${entry.time}`}
                  </span>
                </div>
                <span className="font-mono text-[13px] font-semibold text-[var(--ink)]">
                  {entry.score}/100
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={clearHistory}
            className="mt-3 flex items-center gap-1.5 font-mono text-[11px] text-[var(--coral-dark)] hover:text-[var(--coral)] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear History
          </button>
        </div>
      )}
    </div>
  );
}

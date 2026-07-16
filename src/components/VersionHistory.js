"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Trash2, Clock, Eye, ArrowUp, ArrowDown } from "lucide-react";

const HISTORY_KEY = "resumeqo_version_history";
const MAX_VERSIONS = 20;

export default function VersionHistory({ currentScore, currentResults, onRestoreVersion }) {
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      try { setHistory(JSON.parse(stored)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (currentScore > 0 && currentResults) {
      const entry = {
        id: Date.now(),
        score: currentScore,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        results: currentResults,
      };
      setHistory((prev) => {
        const updated = [entry, ...prev].slice(0, MAX_VERSIONS);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [currentScore, currentResults]);

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  const prevScore = history.length > 1 ? history[1].score : null;
  const change = prevScore !== null ? currentScore - prevScore : null;

  if (!history.length) return null;

  return (
    <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-6 sm:p-8 mb-6">
      <button onClick={() => setShowHistory(!showHistory)} className="w-full flex items-center justify-between">
        <h3 className="font-serif font-[500] text-[18px] text-[var(--ink)] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[var(--coral)]" /> Score History
        </h3>
        <span className="font-mono text-[12px] text-[var(--ink-soft)]">
          {showHistory ? "▲ Hide" : "▼ Show"} ({history.length})
        </span>
      </button>

      {change !== null && (
        <div className={`mt-3 p-3 rounded-[3px] flex items-center gap-2 text-sm font-mono ${
          change > 0 ? "bg-[var(--green-light)] text-[var(--green)]" : change < 0 ? "bg-[var(--coral-light)] text-[var(--coral-dark)]" : "bg-[var(--line)] text-[var(--ink-soft)]"
        }`}>
          {change > 0 ? <ArrowUp className="w-4 h-4" /> : change < 0 ? <ArrowDown className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          {change > 0 ? `+${change}` : change < 0 ? change : "No change"} from last review
        </div>
      )}

      {showHistory && (
        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
          {history.map((entry, i) => {
            const isCurrent = i === 0;
            const diff = i < history.length - 1 ? entry.score - history[i + 1].score : null;
            return (
              <div key={entry.id} className={`flex items-center justify-between p-3 rounded-[3px] text-sm ${
                isCurrent ? "bg-[var(--green-light)] border border-[var(--green)]" : "bg-[var(--line)]"
              }`}>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-semibold text-[var(--ink)] w-8">{entry.score}</span>
                  <div>
                    <div className="text-[var(--ink-soft)] font-mono text-[11px]">{entry.date} {entry.time}</div>
                    {diff !== null && (
                      <div className={`text-[10px] font-mono ${diff > 0 ? "text-[var(--green)]" : diff < 0 ? "text-[var(--coral-dark)]" : "text-[var(--ink-soft)]"}`}>
                        {diff > 0 ? `+${diff}` : diff < 0 ? diff : "—"} from previous
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onRestoreVersion && !isCurrent && (
                    <button
                      onClick={() => onRestoreVersion(entry.results)}
                      className="font-mono text-[10px] bg-[var(--ink)] text-white px-3 py-1.5 rounded-[2px] hover:bg-[var(--coral)] transition-all flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> View
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <button
            onClick={clearHistory}
            className="w-full font-mono text-[11px] text-[var(--coral-dark)] hover:text-[var(--coral)] transition-colors py-2 flex items-center justify-center gap-1"
          >
            <Trash2 className="w-4 h-4" /> Clear History
          </button>
        </div>
      )}
    </div>
  );
}

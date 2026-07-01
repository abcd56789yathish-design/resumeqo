"use client";

import { useState, useEffect } from "react";
import { Eye } from "lucide-react";

export default function RecruiterHeatmap({ recruiterNotes = [] }) {
  const [simulating, setSimulating] = useState(false);
  const [visibleNote, setVisibleNote] = useState(null);
  const [progress, setProgress] = useState(0);

  const startSimulation = () => {
    setSimulating(true);
    setProgress(0);
    setVisibleNote(null);

    let i = 0;
    const interval = setInterval(() => {
      i++;
      const pct = Math.min((i / 20) * 100, 100);
      setProgress(pct);

      const noteIndex = Math.floor((i / 20) * recruiterNotes.length);
      if (recruiterNotes[noteIndex]) {
        setVisibleNote(noteIndex);
      }

      if (i >= 20) {
        clearInterval(interval);
        setSimulating(false);
      }
    }, 300);
  };

  useEffect(() => {
    return () => setSimulating(false);
  }, []);

  if (!recruiterNotes.length) return null;

  return (
    <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-8 mb-6">
      <h3 className="font-serif font-[500] text-[18px] text-[var(--ink)] mb-3 flex items-center gap-2">
        <Eye className="w-5 h-5 text-[var(--coral)]" /> Recruiter View Simulation
      </h3>
      <p className="text-sm text-[var(--ink-soft)] mb-4">
        Recruiters spend an average of 6 seconds on a resume. Watch what they&apos;d notice.
      </p>

      <button
        onClick={startSimulation}
        disabled={simulating}
        className={`font-mono text-[12px] px-4 py-2 rounded-[2px] transition-all mb-4 ${
          simulating
            ? "bg-[var(--line)] text-[var(--ink-soft)] cursor-not-allowed"
            : "bg-[var(--ink)] text-white hover:bg-[var(--coral)]"
        }`}
      >
        {simulating ? "Simulating..." : "▶ Simulate 6-Second Skim"}
      </button>

      {simulating && (
        <div className="mb-4">
          <div className="w-full h-2 bg-[var(--line)] rounded-[2px] overflow-hidden">
            <div
              className="h-full bg-[var(--coral)] rounded-[2px] transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="font-mono text-[10px] text-[var(--ink-soft)] mt-1">
            {Math.round((progress / 100) * 6)}s of 6s
          </p>
        </div>
      )}

      <div className="space-y-2">
        {recruiterNotes.map((note, i) => (
          <div
            key={i}
            className={`p-3 rounded-[3px] border-l-4 transition-all duration-500 ${
              visibleNote === i || !simulating
                ? "opacity-100 border-[var(--coral)] bg-[var(--coral-light)]"
                : "opacity-30 border-[var(--line)] bg-[var(--line)]/30"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] font-semibold text-[var(--coral-dark)] uppercase">
                {note.section}
              </span>
              <span className="font-mono text-[10px] text-[var(--ink-soft)]">{note.timeSpent}</span>
            </div>
            <p className="text-sm text-[var(--ink)]">{note.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

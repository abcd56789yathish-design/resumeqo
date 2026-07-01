"use client";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

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

export default function ScoreCard({ score }) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-8 text-center">
      <h2 className="font-mono text-[12px] text-[var(--ink-soft)] uppercase tracking-[0.06em] mb-4">
        Overall Score
      </h2>
      <div className="w-44 h-44 mx-auto mb-3">
        <CircularProgressbar
          value={score}
          text={`${score}`}
          styles={buildStyles({
            pathColor: color,
            textColor: color,
            trailColor: "#ECE8DC",
            textSize: "36px",
            fontWeight: "bold",
            pathTransitionDuration: 1.5,
          })}
        />
      </div>
      <div
        className="inline-block font-mono text-[12px] font-semibold px-4 py-2 rounded-[3px]"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {label}
      </div>
    </div>
  );
}

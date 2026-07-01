"use client";

export default function ImprovementList({ improvements }) {
  if (!improvements || improvements.length === 0) return null;

  return (
    <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-8">
      <h3 className="font-serif font-[500] text-[18px] text-[var(--ink)] mb-4 flex items-center gap-2">
        <span className="text-[var(--coral)]">❌</span> Needs Improvement
      </h3>
      <div className="space-y-4">
        {improvements.map((item, i) => (
          <div key={i} className="border-l-4 border-[var(--coral)] bg-[var(--coral-light)] rounded-r-[3px] p-4">
            <p className="font-mono text-[11px] font-semibold text-[var(--coral-dark)] uppercase tracking-[0.06em]">
              Section: {item.section}
            </p>
            <p className="text-[var(--coral-dark)] mt-1 text-sm">
              <span className="font-medium">Issue:</span> {item.issue}
            </p>
            <p className="text-[var(--ink)] mt-1 text-sm">
              <span className="font-medium">Fix:</span> {item.fix}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

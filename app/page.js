// ============================================
// LANDING PAGE — Full redesign matching spec
// ============================================

import Link from "next/link";

export default function Home() {
  return (
    <div className="relative z-[1]">
      {/* ===== HERO ===== */}
      <section className="max-w-[1140px] mx-auto px-8 grid md:grid-cols-2 gap-16 items-center pt-24 pb-20">
        <div>
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-5">
            <span className="w-[6px] h-[6px] bg-[var(--coral)] rounded-full animate-pulse-dot"></span>
            <span className="font-mono text-[12px] tracking-[0.06em] text-[var(--coral-dark)] uppercase">AI Resume Reviewer</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif font-[500] text-[clamp(40px,4.4vw,58px)] leading-[1.03] tracking-[-0.01em] text-[var(--ink)]">
            Your resume has <em className="italic text-[var(--coral-dark)]">13 issues</em>.
            <br />
            We&apos;ll find them in 9 seconds.
          </h1>

          <p className="mt-[22px] text-[17px] text-[var(--ink-soft)] max-w-[440px] leading-[1.65]">
            Upload your resume. Our AI marks it up like a recruiter would — line by line,
            redline by redline — then tells you exactly what to fix.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-[18px] mt-[34px] flex-wrap">
            <Link
              href="/review"
              className="font-mono text-[14px] font-medium bg-[var(--coral)] text-white px-[26px] py-[15px] rounded-[3px] inline-flex items-center gap-[10px] shadow-[3px_3px_0_var(--coral-dark)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_var(--coral-dark)] transition-all"
            >
              Analyze your resume free →
            </Link>
          </div>

          <div className="mt-[28px] text-[13px] text-[var(--ink-soft)] font-mono">
            <span className="text-[var(--green)] font-semibold">●</span> No credit card required
            &nbsp;·&nbsp; Results in under 10s
          </div>
        </div>

        {/* Resume mockup */}
        <div className="flex justify-center">
          <div className="relative w-[340px] bg-[var(--paper-card)] border border-[var(--ink)] shadow-[8px_8px_0_rgba(22,33,61,0.12)] p-7 -rotate-[1.2deg]">
            {/* Scan line */}
            <div className="absolute left-[-14px] right-[-14px] h-[2px] bg-[var(--coral)] shadow-[0_0_12px_1px_rgba(232,80,58,0.5)] animate-[scan_3.4s_ease-in-out_infinite]"></div>

            {/* Resume content */}
            <div className="font-serif font-[500] text-[19px]">Jordan Reyes</div>
            <div className="text-[11px] text-[var(--ink-soft)] mt-[2px] tracking-[0.02em]">
              Product Designer · jordan@email.com
            </div>
            <hr className="border-none border-t border-[var(--line)] my-[14px]" />
            <div className="font-mono text-[9px] tracking-[0.08em] text-[var(--ink-soft)] uppercase mt-[14px] mb-[6px]">
              Experience
            </div>
            <div className="h-[7px] bg-[#ECE8DC] rounded-[2px] mb-[6px] w-full"></div>
            <div className="h-[7px] bg-[#ECE8DC] rounded-[2px] mb-[6px] w-[90%]"></div>
            <div className="h-[7px] bg-[#ECE8DC] rounded-[2px] mb-[6px] w-[80%]"></div>
            <div className="font-mono text-[9px] tracking-[0.08em] text-[var(--ink-soft)] uppercase mt-[14px] mb-[6px]">
              Skills
            </div>
            <div className="h-[7px] bg-[#ECE8DC] rounded-[2px] mb-[6px] w-[55%]"></div>
            <div className="h-[7px] bg-[#ECE8DC] rounded-[2px] mb-[6px] w-[70%]"></div>
            <div className="font-mono text-[9px] tracking-[0.08em] text-[var(--ink-soft)] uppercase mt-[14px] mb-[6px]">
              Education
            </div>
            <div className="h-[7px] bg-[#ECE8DC] rounded-[2px] mb-[6px] w-[90%]"></div>

            {/* Annotations */}
            <div className="absolute top-[118px] -right-[58px] font-mono text-[10.5px] font-semibold px-[7px] py-[3px] rounded-[2px] bg-[var(--coral-light)] text-[var(--coral-dark)] border border-[var(--coral)] opacity-0 translate-y-1 scale-90 animate-[annIn_0.5s_ease_1.1s_forwards]">
              weak verb
            </div>
            <div className="absolute top-[206px] -right-[78px] font-mono text-[10.5px] font-semibold px-[7px] py-[3px] rounded-[2px] bg-[var(--green-light)] text-[var(--green)] border border-[var(--green)] opacity-0 translate-y-1 scale-90 animate-[annIn_0.5s_ease_1.6s_forwards]">
              +keyword match
            </div>
            <div className="absolute top-[280px] -left-[72px] font-mono text-[10.5px] font-semibold px-[7px] py-[3px] rounded-[2px] bg-[var(--coral-light)] text-[var(--coral-dark)] border border-[var(--coral)] opacity-0 translate-y-1 scale-90 animate-[annIn_0.5s_ease_2.1s_forwards]">
              no metrics
            </div>

            {/* Score badge */}
            <div className="absolute -bottom-[26px] -left-[26px] w-[84px] h-[84px] rounded-full bg-[var(--ink)] text-[var(--paper)] flex flex-col items-center justify-center border-[3px] border-[var(--paper)] shadow-[4px_4px_0_rgba(22,33,61,0.18)]">
              <div className="font-serif text-[26px] font-semibold leading-[1]">87</div>
              <div className="font-mono text-[8px] text-[#A9B0C4] mt-[2px]">SCORE</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== LOGO STRIP ===== */}
      <div className="border-t border-b border-[var(--line)] py-[22px] px-8">
        <div className="max-w-[1140px] mx-auto flex items-center justify-between flex-wrap gap-[18px]">
          <span className="font-mono text-[11px] text-[var(--ink-soft)] tracking-[0.05em]">
            TRUSTED BY JOB SEEKERS HEADED TO
          </span>
          <div className="flex gap-[34px] font-serif text-[15px] text-[#9B9788] flex-wrap">
            <span>Google</span>
            <span>Stripe</span>
            <span>Figma</span>
            <span>Notion</span>
            <span>Amazon</span>
          </div>
        </div>
      </div>

      {/* ===== FEATURES ===== */}
      <section id="features" className="max-w-[1140px] mx-auto px-8 py-[100px]">
        <div className="mb-14">
          <span className="font-mono text-[12px] text-[var(--coral-dark)] tracking-[0.06em] uppercase block mb-[14px]">
            What you get
          </span>
          <h2 className="font-serif font-[500] text-[clamp(28px,3vw,38px)] leading-[1.15] max-w-[600px]">
            Everything a career coach would tell you — minus the $200 hourly rate.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 border border-[var(--line)]">
          {/* Feature 1 */}
          <div className="bg-[var(--paper-card)] p-9 border-r border-[var(--line)]">
            <div className="font-mono text-[11px] text-[var(--coral)] mb-[18px]">01</div>
            <div className="w-[38px] h-[38px] border-[1.5px] border-[var(--ink)] rounded-full flex items-center justify-center mb-5 font-serif text-[17px]">
              87
            </div>
            <h3 className="font-serif font-[500] text-[19px] mb-[10px]">Smart score analysis</h3>
            <p className="text-[14.5px] text-[var(--ink-soft)] leading-[1.6]">
              A score out of 100 across five categories: formatting, content, keywords, experience, and education.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[var(--paper-card)] p-9 border-r border-[var(--line)]">
            <div className="font-mono text-[11px] text-[var(--coral)] mb-[18px]">02</div>
            <div className="w-[38px] h-[38px] border-[1.5px] border-[var(--ink)] rounded-full flex items-center justify-center mb-5 font-serif text-[17px]">
              ✎
            </div>
            <h3 className="font-serif font-[500] text-[19px] mb-[10px]">Line-by-line edits</h3>
            <p className="text-[14.5px] text-[var(--ink-soft)] leading-[1.6]">
              Specific rewrites for weak bullet points, missing metrics, and vague language — not generic advice.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[var(--paper-card)] p-9">
            <div className="font-mono text-[11px] text-[var(--coral)] mb-[18px]">03</div>
            <div className="w-[38px] h-[38px] border-[1.5px] border-[var(--ink)] rounded-full flex items-center justify-center mb-5 font-serif text-[17px]">
              ⌕
            </div>
            <h3 className="font-serif font-[500] text-[19px] mb-[10px]">ATS optimization</h3>
            <p className="text-[14.5px] text-[var(--ink-soft)] leading-[1.6]">
              Check if your resume clears applicant tracking systems and see exactly which keywords are missing.
            </p>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS (Dark) ===== */}
      <section id="how" className="bg-[var(--ink)] text-[var(--paper)] px-8 py-[100px]">
        <div className="max-w-[1140px] mx-auto">
          <div className="mb-14 max-w-[600px]">
            <span className="font-mono text-[12px] text-[#F2A493] tracking-[0.06em] uppercase block mb-[14px]">
              How it works
            </span>
            <h2 className="font-serif font-[500] text-[clamp(28px,3vw,38px)] leading-[1.15]">
              Three steps. No back and forth.
            </h2>
            <p className="mt-[14px] text-[16px] text-[#B8BFD4] max-w-[480px]">
              Drop in your resume, add a job description if you have one, and read your results.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {/* Step 1 */}
            <div className="pt-[8px] border-t border-white/18">
              <span className="font-mono text-[13px] text-[var(--coral)] block mb-[14px]">[ 01 ]</span>
              <h3 className="font-serif font-[500] text-[20px] mb-[10px]">Upload your resume</h3>
              <p className="text-[14.5px] text-[#B8BFD4] leading-[1.65]">
                Drag and drop a PDF. Paste the job description too, for a review targeted to the role.
              </p>
            </div>
            {/* Step 2 */}
            <div className="pt-[8px] border-t border-white/18">
              <span className="font-mono text-[13px] text-[var(--coral)] block mb-[14px]">[ 02 ]</span>
              <h3 className="font-serif font-[500] text-[20px] mb-[10px]">AI reads every line</h3>
              <p className="text-[14.5px] text-[#B8BFD4] leading-[1.65]">
                The model checks your resume against hiring best practices and the job description you gave it.
              </p>
            </div>
            {/* Step 3 */}
            <div className="pt-[8px] border-t border-white/18">
              <span className="font-mono text-[13px] text-[var(--coral)] block mb-[14px]">[ 03 ]</span>
              <h3 className="font-serif font-[500] text-[20px] mb-[10px]">Get marked-up results</h3>
              <p className="text-[14.5px] text-[#B8BFD4] leading-[1.65]">
                Your score, section-by-section fixes, missing keywords, and an ATS compatibility check.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SCORE BREAKDOWN ===== */}
      <section className="px-8 py-[100px]">
        <div className="max-w-[1140px] mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="font-mono text-[12px] text-[var(--coral-dark)] tracking-[0.06em] uppercase block mb-[14px]">
              The breakdown
            </span>
            <h2 className="font-serif font-[500] text-[clamp(28px,3vw,38px)] leading-[1.15]">
              Not just a number. A reason for every point.
            </h2>
            <p className="mt-[14px] text-[16px] text-[var(--ink-soft)] max-w-[420px]">
              Every category in your score links back to the exact line that earned or lost it.
            </p>
          </div>

          {/* Score panel */}
          <div className="bg-[var(--paper-card)] border border-[var(--ink)] p-8 shadow-[6px_6px_0_rgba(22,33,61,0.1)]">
            <ScoreRow label="Formatting" pct={92} pts="23/25" color="var(--green)" />
            <ScoreRow label="Content quality" pct={80} pts="20/25" color="var(--green)" />
            <ScoreRow label="Keywords" pct={52} pts="10/20" color="var(--coral)" />
            <ScoreRow label="Experience" pct={88} pts="22/25" color="var(--green)" />
            <ScoreRow label="Education" pct={48} pts="12/20" color="var(--coral)" />
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section id="pricing" className="px-8 pb-[100px]">
        <div className="max-w-[1140px] mx-auto text-center border border-[var(--ink)] bg-[var(--paper-card)] py-[72px] px-10 relative shadow-[8px_8px_0_var(--coral)]">
          <h2 className="font-serif font-[500] text-[clamp(30px,3.6vw,44px)] leading-[1.12] max-w-[620px] mx-auto">
            Find out what&apos;s costing you interviews.
          </h2>
          <p className="mt-[16px] text-[16px] text-[var(--ink-soft)]">
            Join thousands of job seekers who fixed their resume before it ever reached a recruiter.
          </p>
          <Link
            href="/review"
            className="inline-flex font-mono text-[14px] font-medium bg-[var(--coral)] text-white px-[26px] py-[15px] rounded-[3px] items-center gap-[10px] shadow-[3px_3px_0_var(--coral-dark)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_var(--coral-dark)] transition-all mt-[30px]"
          >
            Start your free review →
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[var(--line)] px-8 py-9">
        <div className="max-w-[1140px] mx-auto flex justify-between items-center text-[13px] text-[var(--ink-soft)] flex-wrap gap-3">
          <div className="font-mono font-semibold text-[15px] tracking-tight flex items-center gap-2 text-[var(--ink)]">
            <span className="w-[20px] h-[20px] bg-[var(--coral)] rounded-[3px] inline-block relative">
              <span className="absolute left-[4px] top-[5px] w-[8px] h-[2px] bg-[var(--paper)]"></span>
              <span className="absolute left-[4px] top-[9px] w-[12px] h-[2px] bg-[var(--paper)]"></span>
            </span>
            resumeqo
          </div>
          <span>© 2026 Resumeqo. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

// Score row component
function ScoreRow({ label, pct, pts, color }) {
  return (
    <div className="flex items-center justify-between py-[13px] border-b border-[var(--line)] text-[14px] last:border-b-0">
      <div className="flex items-center gap-[10px]">
        <span className="w-[8px] h-[8px] rounded-full" style={{ background: color }}></span>
        {label}
      </div>
      <div className="flex items-center">
        <div className="w-[120px] h-[6px] bg-[#ECE8DC] rounded-[3px] overflow-hidden mr-[12px]">
          <div className="h-full rounded-[3px]" style={{ width: `${pct}%`, background: color }}></div>
        </div>
        <span className="font-mono text-[13px] font-semibold w-[34px] text-right">{pts}</span>
      </div>
    </div>
  );
}

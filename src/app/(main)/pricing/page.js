"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check, X, Sparkles, Loader2, ArrowRight, ArrowUp, ArrowDown,
  RefreshCw, FileEdit, Layers, Eye, AlertTriangle, CheckCircle, PenLine, Copy, WandSparkles, MessageSquare, Send
} from "lucide-react";

const REWRITE_EXAMPLES = [
  {
    original: "Responsible for managing a team of engineers",
    rewritten: "Led a team of 12 engineers, delivering 3 major product launches on time and under budget",
    tone: "Quantified",
  },
  {
    original: "Helped improve customer satisfaction scores",
    rewritten: "Drove NPS score from 42 to 78 across 200+ enterprise accounts in Q2 2025",
    tone: "Quantified",
  },
  {
    original: "Assisted with various marketing campaigns",
    rewritten: "Orchestrated 15 multi-channel campaigns generating $2.4M in pipeline revenue",
    tone: "Senior",
  },
];

const MULTI_ROLE_DATA = [
  { role: "Product Manager", score: 72, match: "high", keywords: ["Roadmap Planning", "Stakeholder Mgmt", "Agile/Scrum", "User Research", "A/B Testing"], gap: ["OKR framework", "Cross-functional lead"] },
  { role: "Project Lead", score: 68, match: "medium", keywords: ["Budget Mgmt", "Resource Planning", "Risk Assessment", "Timeline Tracking"], gap: ["PMP certification", "Vendor negotiation"] },
  { role: "Operations", score: 58, match: "low", keywords: ["Process Optimization", "KPI Dashboards"], gap: ["Supply chain", "P&L ownership", "Headcount planning"] },
];

const ATS_EXAMPLE = {
  failing: {
    issues: [
      "No standard section headings (uses icons instead of text)",
      "Skills listed in a 3-column table — parsers read left-to-right only",
      "Contact info embedded in a header image — not machine-readable",
      "Dates formatted as 'Summer 2024' — parsers need 'MM/YYYY'",
      "PDF was created from a scanned image — no selectable text layer",
    ],
    score: 34,
  },
  passing: {
    fixes: [
      "Clear 'Experience', 'Education', 'Skills' text headings",
      "Single-column layout with inline skill tags",
      "Plain text contact information in the header",
      "Dates standardized to '06/2024' format",
      "Created from native DOCX — fully selectable text",
    ],
    score: 91,
  },
};

const COVER_LETTER_EXAMPLE = {
  subject: "Application for Product Manager — Sarah Chen",
  body: `Dear Hiring Manager,

As a product manager with 6 years of experience driving 0-to-1 product launches and a track record of increasing user engagement by 340%, I was excited to see the Senior Product Manager role at your company.

At my current role at TechFlow, I led the discovery and delivery of a B2B collaboration platform that grew from 0 to 50,000 users in 8 months. By implementing a structured user research cadence and cross-functional prioritization framework, our team reduced time-to-market by 40% while maintaining a 4.8/5 CSAT score.

Your emphasis on data-informed decision-making resonates with my approach. I built the analytics infrastructure that uncovered a $2M annual revenue opportunity through feature adoption analysis — leading to a product pivot that increased enterprise deal size by 65%.

I would welcome the opportunity to discuss how my experience in product strategy, user research, and cross-functional leadership aligns with the challenges your team is tackling.

Best regards,
Sarah Chen`,
};

const DEMOS = [
  { id: "rewriter", label: "AI Rewriter", icon: FileEdit },
  { id: "multirole", label: "Multi-Role", icon: Layers },
  { id: "comparison", label: "Before/After", icon: Eye },
  { id: "ats", label: "ATS Check", icon: AlertTriangle },
  { id: "coverletter", label: "Cover Letter", icon: PenLine },
  { id: "tailor", label: "Tailor Resume", icon: WandSparkles },
  { id: "outreach", label: "Cold Outreach", icon: MessageSquare },
];

export default function PricingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeDemo, setActiveDemo] = useState("rewriter");
  const [rewriteRevealed, setRewriteRevealed] = useState({});
  const [comparisonRevealed, setComparisonRevealed] = useState(false);

  const handleProPlan = () => {
    const productId = process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID;
    if (!productId) {
      setError("Polar Product ID is not configured.");
      return;
    }
    window.location.href = `/api/checkout?products=${encodeURIComponent(productId)}`;
  };

  const plans = [
    {
      name: "Free", price: "$0", period: "forever",
      desc: "Perfect for trying out the service",
      features: [
        ["200 credits (~2 reviews)", true], ["Basic score analysis", true],
        ["Improvement suggestions", true], ["ATS compatibility check", true],
        ["Keyword suggestions", true], ["Unlimited reviews", false],
        ["AI bullet rewriter", false], ["Multi-role targeting", false],
        ["Before/after comparison", false], ["Cover letter generator", false],
        ["Score history tracking", false],
        ["Priority support", false],
        ["Interview Q&A Coach", false],
      ],
      cta: "Get Started Free",
      action: () => router.push("/review"),
      featured: false,
    },
    {
      name: "Pro", price: "$19", period: "/month",
      desc: "For serious job seekers",
      features: [
        ["5,000 credits (~50 reviews)", true], ["Basic score analysis", true],
        ["Improvement suggestions", true], ["ATS compatibility check", true],
        ["Keyword suggestions", true], ["AI bullet rewriter", true],
        ["Multi-role targeting", true], ["Before/after comparison", true],
        ["Cover letter generator", true], ["Score history tracking", true],
        ["Priority support", true], ["Export results (PDF)", true],
        ["AI resume tailoring for any job description", true],
        ["Cold outreach writer (LinkedIn DM & email)", true],
        ["Interview Q&A Coach", true],
      ],
      cta: "Upgrade to Pro",
      action: handleProPlan,
      featured: true,
    },
  ];

  const DemoSection = () => {
    const demo = DEMOS.find((d) => d.id === activeDemo);
    const Icon = demo?.icon || Sparkles;

    return (
      <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[8px_8px_0_rgba(22,33,61,0.1)] p-8 md:p-10">
        <div className="flex items-center gap-2 mb-6">
          <Icon className="w-5 h-5 text-[var(--coral)]" />
          <span className="font-mono text-[12px] text-[var(--coral-dark)] uppercase tracking-[0.06em]">{demo.label}</span>
        </div>

        {activeDemo === "rewriter" && (
          <div className="space-y-4">
            <p className="text-[15px] text-[var(--ink)] mb-4">Click any bullet to see an AI rewrite:</p>
            {REWRITE_EXAMPLES.map((ex, i) => {
              const revealed = rewriteRevealed[i];
              return (
                <div key={i} className="border border-[var(--line)] rounded-[3px] overflow-hidden">
                  <div className="p-4 bg-[var(--coral-light)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] text-[var(--coral-dark)] uppercase">Original</span>
                      <button
                        onClick={() => setRewriteRevealed((prev) => ({ ...prev, [i]: !prev[i] }))}
                        className="font-mono text-[11px] text-[var(--coral)] hover:text-[var(--coral-dark)] transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        {revealed ? "Hide" : "Rewrite"}
                      </button>
                    </div>
                    <p className="text-sm text-[var(--ink)] italic">&ldquo;{ex.original}&rdquo;</p>
                  </div>
                  {revealed && (
                    <div className="p-4 bg-[var(--green-light)] border-t border-[var(--green)] animate-fade-in">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-[10px] text-[var(--green)] uppercase">Rewritten</span>
                        <span className="font-mono text-[9px] bg-[var(--green)] text-white px-2 py-0.5 rounded-[2px]">{ex.tone}</span>
                      </div>
                      <p className="text-sm text-[var(--ink)]">&ldquo;{ex.rewritten}&rdquo;</p>
                      <div className="mt-2 flex gap-2">
                        <div className="flex items-center gap-1 text-[10px] text-[var(--green)] font-mono">
                          <CheckCircle className="w-3 h-3" /> Stronger verb
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-[var(--green)] font-mono">
                          <CheckCircle className="w-3 h-3" /> Metrics added
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeDemo === "multirole" && (
          <div className="space-y-6">
            <p className="text-[15px] text-[var(--ink)] mb-4">Same resume, scored against 3 different roles:</p>
            {MULTI_ROLE_DATA.map((role, i) => (
              <div key={i} className="border border-[var(--line)] rounded-[3px] p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-serif font-[500] text-[var(--ink)]">{role.role}</span>
                    <span className={`font-mono text-[11px] px-2 py-0.5 rounded-[2px] ${
                      role.match === "high" ? "bg-[var(--green-light)] text-[var(--green)] border border-[var(--green)]"
                        : role.match === "medium" ? "bg-[#FEF3C7] text-[#D97706] border border-[#D97706]"
                        : "bg-[var(--coral-light)] text-[var(--coral-dark)] border border-[var(--coral)]"
                    }`}>
                      {role.match === "high" ? "Strong Match" : role.match === "medium" ? "Partial Match" : "Weak Match"}
                    </span>
                  </div>
                  <span className="font-mono text-lg font-bold" style={{
                    color: role.score >= 70 ? "#22c55e" : role.score >= 60 ? "#D97706" : "#ef4444"
                  }}>{role.score}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {role.keywords.map((kw, j) => (
                    <span key={j} className="font-mono text-[10px] bg-[var(--green-light)] text-[var(--green)] border border-[var(--green)] px-2 py-0.5 rounded-[2px]">
                      ✓ {kw}
                    </span>
                  ))}
                </div>
                {role.gap.length > 0 && (
                  <div>
                    <p className="font-mono text-[10px] text-[var(--coral-dark)] mb-1">Missing keywords:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {role.gap.map((kw, j) => (
                        <span key={j} className="font-mono text-[10px] bg-[var(--coral-light)] text-[var(--coral-dark)] border border-[var(--coral)] px-2 py-0.5 rounded-[2px]">
                          ✗ {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeDemo === "comparison" && (
          <div className="space-y-4">
            <p className="text-[15px] text-[var(--ink)] mb-4">Score jumped from 62 → 84 after AI-guided edits:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-[var(--coral)] rounded-[3px] p-5 bg-[var(--coral-light)]">
                <div className="text-center mb-4">
                  <span className="font-mono text-[11px] text-[var(--coral-dark)] uppercase">Before</span>
                  <div className="font-serif text-5xl font-[500] text-[var(--coral-dark)] mt-2">62</div>
                  <span className="font-mono text-[11px] text-[var(--coral-dark)]">Below Average</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[var(--ink-soft)]">Formatting</span><span>45</span></div>
                  <div className="w-full h-1.5 bg-white rounded-[3px] overflow-hidden"><div className="h-full bg-[var(--coral)] rounded-[3px]" style={{width:"45%"}}></div></div>
                  <div className="flex justify-between"><span className="text-[var(--ink-soft)]">Content</span><span>58</span></div>
                  <div className="w-full h-1.5 bg-white rounded-[3px] overflow-hidden"><div className="h-full bg-[#D97706] rounded-[3px]" style={{width:"58%"}}></div></div>
                  <div className="flex justify-between"><span className="text-[var(--ink-soft)]">Keywords</span><span>42</span></div>
                  <div className="w-full h-1.5 bg-white rounded-[3px] overflow-hidden"><div className="h-full bg-[var(--coral)] rounded-[3px]" style={{width:"42%"}}></div></div>
                  <div className="flex justify-between"><span className="text-[var(--ink-soft)]">Experience</span><span>70</span></div>
                  <div className="w-full h-1.5 bg-white rounded-[3px] overflow-hidden"><div className="h-full bg-[var(--green)] rounded-[3px]" style={{width:"70%"}}></div></div>
                  <div className="flex justify-between"><span className="text-[var(--ink-soft)]">Education</span><span>80</span></div>
                  <div className="w-full h-1.5 bg-white rounded-[3px] overflow-hidden"><div className="h-full bg-[var(--green)] rounded-[3px]" style={{width:"80%"}}></div></div>
                </div>
              </div>
              <div className="border border-[var(--green)] rounded-[3px] p-5 bg-[var(--green-light)]">
                <div className="text-center mb-4">
                  <span className="font-mono text-[11px] text-[var(--green)] uppercase">After</span>
                  <div className="font-serif text-5xl font-[500] text-[var(--green)] mt-2">84</div>
                  <span className="font-mono text-[11px] text-[var(--green)]">Excellent</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[var(--ink-soft)]">Formatting</span><span>88</span></div>
                  <div className="w-full h-1.5 bg-white rounded-[3px] overflow-hidden"><div className="h-full bg-[var(--green)] rounded-[3px]" style={{width:"88%"}}></div></div>
                  <div className="flex justify-between"><span className="text-[var(--ink-soft)]">Content</span><span>82</span></div>
                  <div className="w-full h-1.5 bg-white rounded-[3px] overflow-hidden"><div className="h-full bg-[var(--green)] rounded-[3px]" style={{width:"82%"}}></div></div>
                  <div className="flex justify-between"><span className="text-[var(--ink-soft)]">Keywords</span><span>79</span></div>
                  <div className="w-full h-1.5 bg-white rounded-[3px] overflow-hidden"><div className="h-full bg-[var(--green)] rounded-[3px]" style={{width:"79%"}}></div></div>
                  <div className="flex justify-between"><span className="text-[var(--ink-soft)]">Experience</span><span>90</span></div>
                  <div className="w-full h-1.5 bg-white rounded-[3px] overflow-hidden"><div className="h-full bg-[var(--green)] rounded-[3px]" style={{width:"90%"}}></div></div>
                  <div className="flex justify-between"><span className="text-[var(--ink-soft)]">Education</span><span>85</span></div>
                  <div className="w-full h-1.5 bg-white rounded-[3px] overflow-hidden"><div className="h-full bg-[var(--green)] rounded-[3px]" style={{width:"85%"}}></div></div>
                </div>
              </div>
            </div>
            <div className="text-center p-4 bg-[var(--ink)] text-white rounded-[3px]">
              <span className="font-mono text-sm flex items-center justify-center gap-2">
                <ArrowUp className="w-5 h-5 text-[var(--green)]" />
                +22 point improvement
                <span className="text-[var(--ink-soft)] text-[11px] ml-2">after applying Pro rewrites</span>
              </span>
            </div>
          </div>
        )}

        {activeDemo === "ats" && (
          <div className="space-y-4">
            <p className="text-[15px] text-[var(--ink)] mb-4">See how small formatting changes fix ATS compatibility:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-[var(--coral)] rounded-[3px] p-5 bg-[var(--coral-light)]">
                <div className="text-center mb-4">
                  <span className="font-mono text-[11px] text-[var(--coral-dark)] uppercase">Original — Fails ATS</span>
                  <div className="font-serif text-4xl font-[500] text-[var(--coral-dark)] mt-2">{ATS_EXAMPLE.failing.score}<span className="text-lg">/100</span></div>
                </div>
                <div className="space-y-2">
                  {ATS_EXAMPLE.failing.issues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm bg-white/60 rounded-[3px] p-2">
                      <AlertTriangle className="w-4 h-4 text-[var(--coral)] shrink-0 mt-0.5" />
                      <span className="text-[var(--coral-dark)]">{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-[var(--green)] rounded-[3px] p-5 bg-[var(--green-light)]">
                <div className="text-center mb-4">
                  <span className="font-mono text-[11px] text-[var(--green)] uppercase">Fixed — Passes ATS</span>
                  <div className="font-serif text-4xl font-[500] text-[var(--green)] mt-2">{ATS_EXAMPLE.passing.score}<span className="text-lg">/100</span></div>
                </div>
                <div className="space-y-2">
                  {ATS_EXAMPLE.passing.fixes.map((fix, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm bg-white/60 rounded-[3px] p-2">
                      <CheckCircle className="w-4 h-4 text-[var(--green)] shrink-0 mt-0.5" />
                      <span className="text-[var(--ink)]">{fix}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-center p-3 bg-[var(--line)] rounded-[3px]">
              <p className="font-mono text-[12px] text-[var(--ink-soft)]">
                ATS score jumped from <span className="text-[var(--coral)] font-semibold">34</span> to <span className="text-[var(--green)] font-semibold">91</span> — a <strong>57-point</strong> recovery
              </p>
            </div>
          </div>
        )}

        {activeDemo === "tailor" && (
          <div className="space-y-4">
            <p className="text-[15px] text-[var(--ink)] mb-4">Your resume rewritten from scratch to match a specific job description:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-[var(--coral)] rounded-[3px] p-5 bg-[var(--coral-light)]">
                <span className="font-mono text-[10px] text-[var(--coral-dark)] uppercase block mb-3">Original Bullet</span>
                <p className="text-sm text-[var(--ink)] italic mb-4">&ldquo;Responsible for managing a team of engineers&rdquo;</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-[var(--coral-dark)]"><X className="w-3.5 h-3.5" /> No metrics</div>
                  <div className="flex items-center gap-2 text-[var(--coral-dark)]"><X className="w-3.5 h-3.5" /> Weak verb</div>
                  <div className="flex items-center gap-2 text-[var(--coral-dark)]"><X className="w-3.5 h-3.5" /> No keywords from JD</div>
                </div>
              </div>
              <div className="border border-[var(--green)] rounded-[3px] p-5 bg-[var(--green-light)]">
                <span className="font-mono text-[10px] text-[var(--green)] uppercase block mb-3">Tailored for Role</span>
                <p className="text-sm text-[var(--ink)] mb-4">&ldquo;Led a cross-functional team of 12 engineers, delivering 3 major product launches on time while reducing cycle time by 30%&rdquo;</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-[var(--green)]"><CheckCircle className="w-3.5 h-3.5" /> Strong action verb</div>
                  <div className="flex items-center gap-2 text-[var(--green)]"><CheckCircle className="w-3.5 h-3.5" /> Quantified metrics</div>
                  <div className="flex items-center gap-2 text-[var(--green)]"><CheckCircle className="w-3.5 h-3.5" /> JD keywords added</div>
                </div>
              </div>
            </div>
            <div className="bg-[var(--ink)] text-white p-4 rounded-[3px] flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <FileEdit className="w-5 h-5 text-[var(--green)]" />
                <span className="font-mono text-[13px]">Every bullet rewritten. Keywords optimized. Ready-to-download PDF.</span>
              </div>
            </div>
          </div>
        )}

        {activeDemo === "outreach" && (
          <div className="space-y-4">
            <p className="text-[15px] text-[var(--ink)] mb-4">Short, personalized cold message referencing your resume strengths — no generic templates:</p>
            <div className="border border-[var(--green)] rounded-[3px] p-5 bg-[var(--green-light)]">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[var(--green)]/30">
                <MessageSquare className="w-5 h-5 text-[var(--green)]" />
                <span className="font-mono text-[10px] text-[var(--green)] uppercase tracking-[0.05em]">LinkedIn DM to Google</span>
              </div>
              <p className="text-sm text-[var(--ink)] leading-relaxed italic">
                &ldquo;Hi — saw you&apos;re hiring a Senior Product Manager at Google. I led product strategy at a Series B that grew ARR from $2M to $8M in 18 months — and I&apos;d love to bring that same 0-to-1 rigor to your team. Open to a 5-min chat this week?&rdquo;
              </p>
              <div className="mt-3 pt-3 border-t border-[var(--green)]/30 flex items-center gap-3 text-[11px] text-[var(--ink-soft)] font-mono">
                <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-[var(--green)]" /> References real achievement</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-[var(--green)]" /> Company-specific</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-[var(--green)]" /> Under 300 chars</span>
              </div>
            </div>
            <div className="bg-[var(--ink)] text-white p-4 rounded-[3px] flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Send className="w-5 h-5 text-[var(--green)]" />
                <span className="font-mono text-[13px]">No more &ldquo;I&apos;m interested&rdquo; — every message is as unique as your resume.</span>
              </div>
            </div>
          </div>
        )}

        {activeDemo === "coverletter" && (
          <div>
            <p className="text-[15px] text-[var(--ink)] mb-4">Tailored cover letter generated from your resume + job description:</p>
            <div className="border border-[var(--line)] rounded-[3px] p-5 bg-white">
              <div className="mb-3 pb-3 border-b border-[var(--line)]">
                <p className="font-mono text-[12px] text-[var(--ink-soft)]">{COVER_LETTER_EXAMPLE.subject}</p>
              </div>
              <div className="whitespace-pre-wrap text-sm text-[var(--ink)] leading-relaxed font-sans">
                {COVER_LETTER_EXAMPLE.body}
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center gap-3 text-[11px] text-[var(--ink-soft)] font-mono">
                <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-[var(--green)]" /> Tailored to JD</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-[var(--green)]" /> Uses resume metrics</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-[var(--green)]" /> Professional tone</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-[var(--ink)] text-white rounded-[3px] flex items-center justify-between flex-wrap gap-3">
          <span className="font-mono text-[13px]">This is a Pro feature</span>
          <button
            onClick={handleProPlan}
            disabled={isLoading}
            className="font-mono text-[12px] bg-[var(--coral)] text-white px-5 py-2.5 rounded-[3px] hover:bg-[var(--coral-dark)] transition-all flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Upgrade to Pro — $19/month
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative z-[1] min-h-screen py-16 px-8">
      <div className="max-w-[960px] mx-auto">
        <div className="text-center mb-12">
          <div className="font-mono text-[12px] tracking-[0.06em] text-[var(--coral-dark)] uppercase mb-4">
            Pricing
          </div>
          <h1 className="font-serif font-[500] text-[clamp(32px,4vw,42px)] text-[var(--ink)] mb-3">
            Simple, Transparent Pricing
          </h1>
          <p className="text-[var(--ink-soft)] text-[17px]">
            Start with a free review. Upgrade when you need more.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 bg-[var(--coral-light)] border border-[var(--coral)] rounded-[3px] p-4 text-[var(--coral-dark)] text-sm text-center">{error}</div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-[720px] mx-auto mb-20">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-[var(--paper-card)] border p-8 relative ${plan.featured ? "border-[var(--coral)] shadow-[6px_6px_0_var(--coral)]" : "border-[var(--ink)] shadow-[6px_6px_0_rgba(22,33,61,0.08)]"}`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--coral)] text-white font-mono text-[11px] px-4 py-1 rounded-[3px]">Most Popular</div>
              )}
              <h2 className="font-serif font-[500] text-2xl text-[var(--ink)] mb-2">{plan.name}</h2>
              <p className="text-[var(--ink-soft)] text-sm mb-6">{plan.desc}</p>
              <div className="mb-6">
                <span className="font-serif text-5xl font-[500] text-[var(--ink)]">{plan.price}</span>
                <span className="text-[var(--ink-soft)] text-lg ml-1">{plan.period}</span>
              </div>
              <button
                onClick={plan.action}
                disabled={isLoading && plan.featured}
                className={`w-full font-mono text-[14px] font-medium py-[15px] rounded-[3px] transition-all flex items-center justify-center gap-2 mb-8 ${
                  plan.featured
                    ? "bg-[var(--coral)] text-white shadow-[3px_3px_0_var(--coral-dark)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_var(--coral-dark)]"
                    : "bg-[var(--paper-card)] text-[var(--ink)] border border-[var(--ink)] hover:bg-[var(--line)]"
                }`}
              >
                {isLoading && plan.featured ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <><Sparkles className="w-5 h-5" /> {plan.cta}</>}
              </button>
              <div className="space-y-3">
                <p className="font-mono text-[11px] text-[var(--ink-soft)] uppercase tracking-[0.05em]">What&apos;s included:</p>
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    {f[1]
                      ? <Check className="w-5 h-5 text-[var(--green)] shrink-0" />
                      : <X className="w-5 h-5 text-[var(--line)] shrink-0" />
                    }
                    <span className={f[1] ? "text-[var(--ink)]" : "text-[var(--ink-soft)]"}>{f[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8 text-center">
          <span className="font-mono text-[12px] tracking-[0.06em] text-[var(--coral-dark)] uppercase block mb-3">
            See Pro in action
          </span>
          <h2 className="font-serif font-[500] text-[clamp(24px,2.8vw,34px)] text-[var(--ink)]">
            Features that actually move the needle
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {DEMOS.map((demo) => {
            const DIcon = demo.icon;
            return (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(demo.id)}
                className={`font-mono text-[12px] px-4 py-2.5 rounded-[3px] transition-all flex items-center gap-2 ${
                  activeDemo === demo.id
                    ? "bg-[var(--ink)] text-white"
                    : "bg-[var(--paper-card)] border border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink)]"
                }`}
              >
                <DIcon className="w-4 h-4" />
                {demo.label}
              </button>
            );
          })}
        </div>

        <DemoSection />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Sparkles, Loader2 } from "lucide-react";

export default function PricingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleProPlan = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      if (data.url) window.location.href = data.url;
      else throw new Error("No checkout URL");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const plans = [
    {
      name: "Free", price: "$0", period: "forever",
      desc: "Perfect for trying out the service",
      features: [
        ["1 resume review", true], ["Basic score analysis", true],
        ["Improvement suggestions", true], ["ATS compatibility check", true],
        ["Keyword suggestions", true], ["Unlimited reviews", false],
        ["Detailed section analysis", false], ["Priority support", false],
        ["Export results (PDF)", false],
      ],
      cta: "Get Started Free",
      action: () => router.push("/review"),
      featured: false,
    },
    {
      name: "Pro", price: "$19", period: "/month",
      desc: "For serious job seekers",
      features: [
        ["1 resume review", true], ["Basic score analysis", true],
        ["Improvement suggestions", true], ["ATS compatibility check", true],
        ["Keyword suggestions", true], ["Unlimited reviews", true],
        ["Detailed section analysis", true], ["Priority support", true],
        ["Export results (PDF)", true],
      ],
      cta: "Upgrade to Pro",
      action: handleProPlan,
      featured: true,
    },
  ];

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

        <div className="grid md:grid-cols-2 gap-8 max-w-[720px] mx-auto">
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
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const checkoutId = searchParams.get("checkoutId");

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  return (
    <div className="relative z-[1] min-h-screen flex items-center justify-center px-8">
      <div className="max-w-[480px] w-full bg-[var(--paper-card)] border border-[var(--ink)] shadow-[8px_8px_0_rgba(22,33,61,0.1)] p-10 text-center">
        <div className="w-20 h-20 bg-[var(--green-light)] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-[var(--green)]" />
        </div>
        <h1 className="font-serif font-[500] text-3xl text-[var(--ink)] mb-3">Payment Successful! 🎉</h1>
        <p className="text-[var(--ink-soft)] mb-6 text-[17px]">
          Welcome to <span className="font-semibold text-[var(--coral-dark)]">Resumeqo Pro</span>!
          You now have <strong>5,000 credits</strong> to spend on resume reviews.
        </p>
        <div className="bg-[var(--green-light)] border border-[var(--green)] rounded-[3px] p-6 mb-8 text-left">
          <h2 className="font-serif font-[500] text-[17px] text-[var(--green)] mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> What&apos;s Next?
          </h2>
          <ul className="space-y-2 text-sm text-[var(--ink)]">
            <li className="flex items-start gap-2"><span className="text-[var(--green)]">1.</span> Upload your resume for a detailed review</li>
            <li className="flex items-start gap-2"><span className="text-[var(--green)]">2.</span> Get AI-powered analysis and improvement suggestions</li>
            <li className="flex items-start gap-2"><span className="text-[var(--green)]">3.</span> Improve and land your dream job!</li>
          </ul>
        </div>
        <button
          onClick={() => router.push("/review")}
          className="w-full font-mono text-[14px] font-medium bg-[var(--coral)] text-white py-[15px] rounded-[3px] shadow-[3px_3px_0_var(--coral-dark)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2"
        >
          Analyze Your Resume Now <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-[var(--ink-soft)] text-[13px] mt-4 font-mono">Redirecting in {countdown}s...</p>
        {checkoutId && <p className="text-[var(--line)] text-xs mt-6">Checkout: {checkoutId}</p>}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="relative z-[1] min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--ink)] border-t-transparent"></div></div>}>
      <SuccessContent />
    </Suspense>
  );
}

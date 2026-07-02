"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import UploadBox from "@/components/UploadBox";
import { Loader2, Lock, X, Sparkles, AlertCircle } from "lucide-react";

const FREE_REVIEW_KEY = "resumeqo_free_review_used";

export default function ReviewPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [freeReviewsLeft, setFreeReviewsLeft] = useState(1);

  useEffect(() => {
    const used = localStorage.getItem(FREE_REVIEW_KEY);
    if (used === "true") {
      setShowUpgradeModal(true);
      setFreeReviewsLeft(0);
    }
  }, []);

  const handleFileSelect = useCallback((selectedFile) => {
    setError("");
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(selectedFile.type)) {
      setError("Only PDF (.pdf), DOC (.doc), and DOCX (.docx) files are accepted.");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError(`File too large (${(selectedFile.size / 1024 / 1024).toFixed(2)}MB). Max 5MB.`);
      return;
    }
    setFile(selectedFile);
  }, []);

  const handleFileRemove = useCallback(() => {
    setFile(null);
    setError("");
  }, []);

  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const handleSubmit = async () => {
    if (!file) {
      setError("Please upload a resume file first.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      setLoadingStep("Reading your resume...");
      await new Promise((r) => setTimeout(r, 800));
      const base64Data = await readFileAsBase64(file);

      setLoadingStep("Analyzing content...");
      await new Promise((r) => setTimeout(r, 600));

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileData: base64Data,
          fileName: file.name,
          fileType: file.type,
          jobTitle,
          jobDescription,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Analysis failed. Please try again.");
      }

      setLoadingStep("Generating score...");
      await new Promise((r) => setTimeout(r, 600));

      const data = await res.json();
      localStorage.setItem(FREE_REVIEW_KEY, "true");
      sessionStorage.setItem("resumeResults", JSON.stringify(data));
      router.push("/results");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <div className="relative z-[1] min-h-screen py-16 px-8">
      <div className="max-w-[640px] mx-auto">
        <div className="text-center mb-10">
          <div className="font-mono text-[12px] tracking-[0.06em] text-[var(--coral-dark)] uppercase flex items-center justify-center gap-2 mb-4">
            <span className="w-[6px] h-[6px] bg-[var(--coral)] rounded-full animate-pulse-dot"></span>
            Free reviews left: {freeReviewsLeft}
          </div>
          <h1 className="font-serif font-[500] text-[clamp(32px,4vw,42px)] leading-[1.1] text-[var(--ink)]">
            Review Your Resume
          </h1>
        </div>

        <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-8 space-y-6">
          <UploadBox file={file} onFileSelect={handleFileSelect} onFileRemove={handleFileRemove} />

          {error && (
            <div className="flex items-center gap-3 bg-[var(--coral-light)] border border-[var(--coral)] rounded-[3px] p-4 text-[var(--coral-dark)] text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="border-t border-[var(--line)] pt-6">
            <h3 className="font-serif font-[500] text-[17px] text-[var(--ink)] mb-4">
              Job Details{" "}
              <span className="font-sans text-[var(--ink-soft)] text-[13px] font-normal">
                (optional but better results)
              </span>
            </h3>

            <div className="mb-4">
              <label htmlFor="jobTitle" className="block text-sm font-medium text-[var(--ink-soft)] mb-1">
                Job Title Applying For
              </label>
              <input
                id="jobTitle"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Software Engineer"
                className="w-full px-4 py-2.5 border border-[var(--line)] rounded-[3px] focus:outline-none focus:border-[var(--ink)] transition-colors text-[var(--ink)] bg-transparent"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="jobDesc" className="block text-sm font-medium text-[var(--ink-soft)] mb-1">
                Job Description (paste here)
              </label>
              <textarea
                id="jobDesc"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here for a more targeted analysis..."
                rows={5}
                className="w-full px-4 py-2.5 border border-[var(--line)] rounded-[3px] focus:outline-none focus:border-[var(--ink)] transition-colors text-[var(--ink)] bg-transparent resize-none"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full font-mono text-[14px] font-medium rounded-[3px] transition-all flex items-center justify-center gap-2 py-[15px] ${
              isLoading
                ? "bg-[var(--line)] text-[var(--ink-soft)] cursor-not-allowed"
                : "bg-[var(--coral)] text-white shadow-[3px_3px_0_var(--coral-dark)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_var(--coral-dark)]"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {loadingStep}
              </>
            ) : (
              "Analyze My Resume →"
            )}
          </button>

          {!isLoading && (
            <p className="text-center text-[13px] text-[var(--ink-soft)] font-mono">
              ⚡ Takes about 30 seconds
            </p>
          )}
        </div>
      </div>

      {showUpgradeModal && (
        <div className="fixed inset-0 bg-[var(--ink)]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[8px_8px_0_rgba(22,33,61,0.12)] max-w-md w-full p-8 relative animate-fade-in">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-[var(--coral-light)] rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-[var(--ink-soft)]" />
            </button>

            <div className="w-16 h-16 bg-[var(--line)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[var(--ink)]" />
            </div>

            <h3 className="text-2xl font-serif font-[500] text-center text-[var(--ink)] mb-3">
              Free Review Used
            </h3>

            <p className="text-[var(--ink-soft)] text-center mb-6">
              You&apos;ve used your free review! Upgrade to Pro for unlimited reviews.
            </p>

            <button
              onClick={() => { setShowUpgradeModal(false); router.push("/pricing"); }}
              className="w-full font-mono text-[14px] font-medium bg-[var(--coral)] text-white py-[15px] rounded-[3px] shadow-[3px_3px_0_var(--coral-dark)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all mb-3 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Upgrade to Pro - $19/month
            </button>

            <button
              onClick={() => setShowUpgradeModal(false)}
              className="w-full text-[var(--ink-soft)] hover:text-[var(--ink)] py-2 font-medium transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

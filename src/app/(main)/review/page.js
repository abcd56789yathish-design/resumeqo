"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import UploadBox from "@/components/UploadBox";
import { Loader2, Sparkles, AlertCircle, Plus, Layers, Lock, X } from "lucide-react";

const PRO_KEY = "resumeqo_pro";

function isPro() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PRO_KEY) === "true";
}

export default function ReviewPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [fileText, setFileText] = useState("");
  const [roles, setRoles] = useState([{ jobTitle: "", jobDescription: "" }]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [isProPlan, setIsProPlan] = useState(false);

  useEffect(() => {
    setIsProPlan(isPro());
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

  const addRole = () => {
    if (roles.length >= 3) return;
    if (roles.length >= 1 && !isProPlan) {
      setUpgradeMessage("Multi-role targeting is a Pro feature. Upgrade to compare your resume against multiple job descriptions at once.");
      setShowUpgrade(true);
      return;
    }
    setRoles((prev) => [...prev, { jobTitle: "", jobDescription: "" }]);
  };

  const removeRole = (index) => {
    if (roles.length <= 1) return;
    setRoles((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRole = (index, field, value) => {
    setRoles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const readFileAsText = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
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

      const activeRoles = roles.filter((r) => r.jobTitle || r.jobDescription);
      if (activeRoles.length === 0) activeRoles.push(roles[0]);

      const results = [];
      for (let i = 0; i < activeRoles.length; i++) {
        const role = activeRoles[i];
        setLoadingStep(`Analyzing for "${role.jobTitle || `Role ${i + 1}`}"...`);

        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileData: base64Data,
            fileName: file.name,
            fileType: file.type,
            jobTitle: role.jobTitle,
            jobDescription: role.jobDescription,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Analysis failed. Please try again.");
        }

        const data = await res.json();
        if (data._resumeText) {
          sessionStorage.setItem("resumeqo_resume_text", data._resumeText);
        }
        data.roleName = role.jobTitle || `Role ${i + 1}`;
        results.push(data);
      }

      setLoadingStep("Generating score...");
      await new Promise((r) => setTimeout(r, 600));

      if (activeRoles.length === 1) {
        sessionStorage.setItem("resumeResults", JSON.stringify(results[0]));
      } else {
        sessionStorage.setItem("resumeResults", JSON.stringify(results));
      }

      const resumeText = sessionStorage.getItem("resumeqo_resume_text") || "";
      if (resumeText) {
        const prevResults = sessionStorage.getItem("resumeResults");
        if (prevResults) {
          sessionStorage.setItem("resumeqo_before_results", prevResults);
        }
      }

      sessionStorage.setItem("resumeqo_job_title", activeRoles[0]?.jobTitle || "");
      sessionStorage.setItem("resumeqo_job_desc", activeRoles[0]?.jobDescription || "");

      router.push("/results");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <div className="relative z-[1] min-h-screen py-12 md:py-16 px-6 sm:px-8">
      <div className="max-w-[640px] mx-auto">
        <div className="text-center mb-10">
          <div className={`font-mono text-[12px] tracking-[0.06em] uppercase flex items-center justify-center gap-2 mb-4 ${isProPlan ? "text-[var(--green)]" : "text-[var(--ink-soft)]"}`}>
            <span className={`w-[6px] h-[6px] rounded-full animate-pulse-dot ${isProPlan ? "bg-[var(--green)]" : "bg-[var(--coral)]"}`}></span>
            {isProPlan ? "Pro mode — all features unlocked" : "Free tier — 1 role, upgrade for multi-role"}
            {!isProPlan && (
              <button onClick={() => { localStorage.setItem(PRO_KEY, "true"); window.location.reload(); }} className="font-mono text-[10px] text-[var(--coral)] hover:text-[var(--coral-dark)] underline ml-1">
                Enable Pro (dev)
              </button>
            )}
          </div>
          <h1 className="font-serif font-[500] text-[clamp(32px,4vw,42px)] leading-[1.1] text-[var(--ink)]">
            Review Your Resume
          </h1>
        </div>

        <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-6 sm:p-8 space-y-6">
          <UploadBox file={file} onFileSelect={handleFileSelect} onFileRemove={handleFileRemove} />

          {error && (
            <div className="flex items-center gap-3 bg-[var(--coral-light)] border border-[var(--coral)] rounded-[3px] p-4 text-[var(--coral-dark)] text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="border-t border-[var(--line)] pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-[500] text-[17px] text-[var(--ink)]">
                Target Roles{" "}
                <span className="font-sans text-[var(--ink-soft)] text-[13px] font-normal">
                  (up to 3 for multi-role analysis)
                </span>
              </h3>
              {roles.length < 3 && (
                <button
                  onClick={addRole}
                  className="font-mono text-[11px] text-[var(--coral)] hover:text-[var(--coral-dark)] transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Role
                </button>
              )}
            </div>

            {roles.length > 1 && (
              <div className="flex gap-2 mb-4">
                <Layers className="w-4 h-4 text-[var(--coral)]" />
                <span className="font-mono text-[11px] text-[var(--ink-soft)]">
                  Multi-role mode: {roles.length} target{roles.length > 1 ? "s" : ""}
                </span>
              </div>
            )}

            {roles.map((role, index) => (
              <div key={index} className={`p-4 mb-4 rounded-[3px] ${roles.length > 1 ? "bg-[var(--line)]/30 border border-[var(--line)]" : ""}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[11px] text-[var(--ink-soft)] uppercase">
                    Role {index + 1}
                  </span>
                  {roles.length > 1 && (
                    <button
                      onClick={() => removeRole(index)}
                      className="p-1 hover:bg-[var(--coral-light)] rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-[var(--coral-dark)]" />
                    </button>
                  )}
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-[var(--ink-soft)] mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={role.jobTitle}
                    onChange={(e) => updateRole(index, "jobTitle", e.target.value)}
                    placeholder="e.g., Software Engineer"
                    className="w-full px-4 py-2.5 border border-[var(--line)] rounded-[3px] focus:outline-none focus:border-[var(--ink)] transition-colors text-[var(--ink)] bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--ink-soft)] mb-1">
                    Job Description
                  </label>
                  <textarea
                    value={role.jobDescription}
                    onChange={(e) => updateRole(index, "jobDescription", e.target.value)}
                    placeholder="Paste the full job description here for a more targeted analysis..."
                    rows={4}
                    className="w-full px-4 py-2.5 border border-[var(--line)] rounded-[3px] focus:outline-none focus:border-[var(--ink)] transition-colors text-[var(--ink)] bg-transparent resize-none"
                  />
                </div>
              </div>
            ))}
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
              `Analyze${roles.length > 1 ? ` ${roles.length} Roles` : " My Resume"} →`
            )}
          </button>

          {!isLoading && (
            <p className="text-center text-[13px] text-[var(--ink-soft)] font-mono">
              ⚡ Takes about 30 seconds
              {roles.length > 1 && ` (${roles.length}x analysis)`}
            </p>
          )}
        </div>
      </div>

      {showUpgrade && (
        <div className="fixed inset-0 bg-[var(--ink)]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[8px_8px_0_rgba(22,33,61,0.12)] max-w-md w-full p-8 relative">
            <button onClick={() => setShowUpgrade(false)} className="absolute top-4 right-4 p-1 hover:bg-[var(--coral-light)] rounded-full transition-colors">
              <X className="w-5 h-5 text-[var(--ink-soft)]" />
            </button>
            <div className="w-16 h-16 bg-[var(--line)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[var(--ink)]" />
            </div>
            <h3 className="text-2xl font-serif font-[500] text-center text-[var(--ink)] mb-3">Pro Feature</h3>
            <p className="text-[var(--ink-soft)] text-center mb-6">{upgradeMessage}</p>
            <button onClick={() => router.push("/pricing")} className="w-full font-mono text-[14px] font-medium bg-[var(--coral)] text-white py-[15px] rounded-[3px] shadow-[3px_3px_0_var(--coral-dark)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all mb-3 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" /> Upgrade to Pro — $19/month
            </button>
            <button onClick={() => setShowUpgrade(false)} className="w-full text-[var(--ink-soft)] hover:text-[var(--ink)] py-2 font-medium transition-colors">
              Maybe Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UploadBox from "@/components/UploadBox";
import {
  Loader2, Sparkles, FileText, Download, AlertCircle,
  CheckCircle, ArrowRight, X, Lock, RefreshCw, Copy
} from "lucide-react";

const PRO_KEY = "resumeqo_pro";

function isPro() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PRO_KEY) === "true";
}

export default function TailorPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("resumeqo_resume_text");
    if (stored) setResumeText(stored);
    const title = sessionStorage.getItem("resumeqo_job_title");
    if (title) setJobTitle(title);
    const desc = sessionStorage.getItem("resumeqo_job_desc");
    if (desc) setJobDescription(desc);
  }, []);

  const handleFileSelect = (selectedFile) => {
    setError("");
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!allowed.includes(selectedFile.type) && !selectedFile.name.endsWith(".txt")) {
      setError("Please upload a PDF, DOCX, or TXT file.");
      return;
    }
    setFile(selectedFile);
  };

  const handleFileRemove = () => {
    setFile(null);
    setError("");
  };

  const readFileAsText = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read file"));
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });

  const handleTailor = async () => {
    let text = resumeText.trim();

    if (file && !text) {
      setIsLoading(true);
      setError("");
      try {
        const buffer = await readFileAsText(file);
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileData: base64,
            fileName: file.name,
            fileType: file.type,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to read file");
        text = data._resumeText || "";
        if (!text) throw new Error("Could not extract text from file.");
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    }

    if (!text || text.length < 20) {
      setError("Please provide a resume (paste text or upload a file).");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please paste a job description.");
      return;
    }

    if (!isPro()) {
      setShowUpgrade(true);
      return;
    }

    setError("");
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: text,
          jobTitle: jobTitle.trim(),
          jobDescription: jobDescription.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tailoring failed.");

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!result?.fullTailoredResume) return;
    setPdfLoading(true);
    try {
      const res = await fetch("/api/tailor/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tailoredText: result.fullTailoredResume,
          jobTitle: jobTitle.trim(),
        }),
      });

      if (!res.ok) throw new Error("PDF generation failed.");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tailored-resume-${jobTitle ? jobTitle.replace(/\s+/g, "-").toLowerCase() : "optimized"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="relative z-[1] min-h-screen py-16 px-8">
      <div className="max-w-[720px] mx-auto">
        <div className="text-center mb-10">
          <div className={`font-mono text-[12px] tracking-[0.06em] uppercase flex items-center justify-center gap-2 mb-4 ${isPro() ? "text-[var(--green)]" : "text-[var(--coral-dark)]"}`}>
            <span className={`w-[6px] h-[6px] rounded-full animate-pulse-dot ${isPro() ? "bg-[var(--green)]" : "bg-[var(--coral)]"}`}></span>
            {isPro() ? "Pro feature — full access" : "Pro feature"}
            {!isPro() && (
              <button onClick={() => { localStorage.setItem(PRO_KEY, "true"); window.location.reload(); }} className="font-mono text-[10px] text-[var(--coral)] hover:text-[var(--coral-dark)] underline ml-1">
                Enable Pro (dev)
              </button>
            )}
          </div>
          <h1 className="font-serif font-[500] text-[clamp(32px,4vw,42px)] leading-[1.1] text-[var(--ink)]">
            Tailor Resume for a Job
          </h1>
          <p className="text-[var(--ink-soft)] text-[17px] mt-3">
            Upload your resume + paste a job description. AI rewrites every bullet and optimizes keywords to match the role.
          </p>
        </div>

        <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--ink-soft)] mb-2">
              Upload Resume <span className="text-[var(--ink-soft)] font-normal">(or paste text below)</span>
            </label>
            <UploadBox file={file} onFileSelect={handleFileSelect} onFileRemove={handleFileRemove} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--ink-soft)] mb-2">
              Resume Text
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your full resume text here..."
              rows={8}
              className="w-full px-4 py-3 border border-[var(--line)] rounded-[3px] focus:outline-none focus:border-[var(--ink)] transition-colors text-[var(--ink)] bg-transparent resize-none font-mono text-[13px]"
            />
          </div>

          <div className="border-t border-[var(--line)] pt-6 space-y-4">
            <h3 className="font-serif font-[500] text-[17px] text-[var(--ink)]">
              Target Job
            </h3>
            <div>
              <label className="block text-sm font-medium text-[var(--ink-soft)] mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
                className="w-full px-4 py-2.5 border border-[var(--line)] rounded-[3px] focus:outline-none focus:border-[var(--ink)] transition-colors text-[var(--ink)] bg-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink-soft)] mb-1">
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={6}
                className="w-full px-4 py-2.5 border border-[var(--line)] rounded-[3px] focus:outline-none focus:border-[var(--ink)] transition-colors text-[var(--ink)] bg-transparent resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-[var(--coral-light)] border border-[var(--coral)] rounded-[3px] p-4 text-[var(--coral-dark)] text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleTailor}
            disabled={isLoading}
            className={`w-full font-mono text-[14px] font-medium rounded-[3px] transition-all flex items-center justify-center gap-2 py-[15px] ${
              isLoading
                ? "bg-[var(--line)] text-[var(--ink-soft)] cursor-not-allowed"
                : "bg-[var(--coral)] text-white shadow-[3px_3px_0_var(--coral-dark)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_var(--coral-dark)]"
            }`}
          >
            {isLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Tailoring your resume...</>
            ) : (
              <><RefreshCw className="w-5 h-5" /> Tailor for This Role</>
            )}
          </button>
        </div>

        {result && (
          <div className="mt-10 space-y-6">
            <div className="text-center">
              <span className="font-mono text-[12px] tracking-[0.06em] text-[var(--green)] uppercase block mb-2">
                Tailored Resume Ready
              </span>
              <h2 className="font-serif font-[500] text-[clamp(24px,2.8vw,30px)] text-[var(--ink)]">
                Before & After
              </h2>
            </div>

            <div className="flex flex-wrap gap-3 justify-center mb-4">
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className={`font-mono text-[12px] px-4 py-2.5 rounded-[3px] transition-all ${
                  showOriginal
                    ? "bg-[var(--coral)] text-white"
                    : "bg-[var(--paper-card)] border border-[var(--line)] text-[var(--ink-soft)]"
                }`}
              >
                {showOriginal ? "Hide Original" : "Show Original"}
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className="font-mono text-[12px] bg-[var(--green)] text-white px-5 py-2.5 rounded-[3px] hover:bg-[var(--green)]/80 transition-all flex items-center gap-2"
              >
                {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {pdfLoading ? "Generating PDF..." : "Download Tailored PDF"}
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {showOriginal && (
                <div className="bg-[var(--paper-card)] border border-[var(--line)] rounded-[3px] p-6">
                  <h3 className="font-mono text-[11px] text-[var(--ink-soft)] uppercase tracking-[0.05em] mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Original Resume
                  </h3>
                  <pre className="whitespace-pre-wrap text-[13px] text-[var(--ink)] font-sans leading-relaxed">
                    {result.original}
                  </pre>
                </div>
              )}

              <div className={showOriginal ? "" : "md:col-span-2"}>
                <div className="bg-[var(--green-light)] border border-[var(--green)] rounded-[3px] p-6">
                  <h3 className="font-mono text-[11px] text-[var(--green)] uppercase tracking-[0.05em] mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Tailored Resume
                  </h3>
                  <pre className="whitespace-pre-wrap text-[13px] text-[var(--ink)] font-sans leading-relaxed">
                    {result.fullTailoredResume}
                  </pre>
                </div>
              </div>
            </div>

            {result.tailoredSummary && (
              <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-8">
                <h3 className="font-serif font-[500] text-[18px] text-[var(--ink)] mb-3">Tailored Summary</h3>
                <p className="text-[var(--ink)]">{result.tailoredSummary}</p>
              </div>
            )}

            {result.tailoredExperience && result.tailoredExperience.length > 0 && (
              <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-8">
                <h3 className="font-serif font-[500] text-[18px] text-[var(--ink)] mb-4">Rewritten Bullet Points</h3>
                <div className="space-y-4">
                  {result.tailoredExperience.map((item, i) => (
                    <div key={i} className="border border-[var(--line)] rounded-[3px] overflow-hidden">
                      <div className="p-4 bg-[var(--coral-light)]">
                        <span className="font-mono text-[10px] text-[var(--coral-dark)] uppercase block mb-1">Original</span>
                        <p className="text-sm text-[var(--ink)] italic">&ldquo;{item.original}&rdquo;</p>
                      </div>
                      <div className="p-4 bg-[var(--green-light)] border-t border-[var(--green)]">
                        <span className="font-mono text-[10px] text-[var(--green)] uppercase block mb-1">Tailored</span>
                        <p className="text-sm text-[var(--ink)]">&ldquo;{item.tailored}&rdquo;</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(result.keywordsAdded?.length > 0 || result.keywordsRemoved?.length > 0) && (
              <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-8">
                <h3 className="font-serif font-[500] text-[18px] text-[var(--ink)] mb-4">Keyword Optimization</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {result.keywordsAdded?.length > 0 && (
                    <div>
                      <p className="font-mono text-[11px] text-[var(--green)] uppercase mb-2">Keywords Added</p>
                      <div className="flex flex-wrap gap-2">
                        {result.keywordsAdded.map((kw, i) => (
                          <span key={i} className="font-mono text-[11px] bg-[var(--green-light)] text-[var(--green)] border border-[var(--green)] px-2 py-1 rounded-[2px]">
                            + {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.keywordsRemoved?.length > 0 && (
                    <div>
                      <p className="font-mono text-[11px] text-[var(--coral-dark)] uppercase mb-2">Keywords Removed</p>
                      <div className="flex flex-wrap gap-2">
                        {result.keywordsRemoved.map((kw, i) => (
                          <span key={i} className="font-mono text-[11px] bg-[var(--coral-light)] text-[var(--coral-dark)] border border-[var(--coral)] px-2 py-1 rounded-[2px]">
                            - {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {result.tailoredSkills?.length > 0 && (
              <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-8">
                <h3 className="font-serif font-[500] text-[18px] text-[var(--ink)] mb-4">Optimized Skills Section</h3>
                <div className="flex flex-wrap gap-2">
                  {result.tailoredSkills.map((skill, i) => (
                    <span key={i} className="font-mono text-[12px] bg-[var(--line)] text-[var(--ink)] px-3 py-1.5 rounded-[2px]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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
            <p className="text-[var(--ink-soft)] text-center mb-6">AI Resume Tailoring is a Pro feature. Upgrade to tailor your resume for specific job descriptions and download a ready-to-use PDF.</p>
            <button onClick={() => router.push("/pricing")} className="w-full font-mono text-[14px] font-medium bg-[var(--coral)] text-white py-[15px] rounded-[3px] shadow-[3px_3px_0_var(--coral-dark)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all mb-3 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" /> Upgrade to Pro — $19/month
            </button>
            <button onClick={() => setShowUpgrade(false)} className="w-full text-[var(--ink-soft)] hover:text-[var(--ink)] py-2 font-medium transition-colors">Maybe Later</button>
          </div>
        </div>
      )}
    </div>
  );
}

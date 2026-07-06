"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UploadBox from "@/components/UploadBox";
import {
  Loader2, Sparkles, Copy, CheckCircle, AlertCircle,
  X, Lock, RefreshCw, Lightbulb, Code, MessageSquare
} from "lucide-react";

const PRO_KEY = "resumeqo_pro";

function isPro() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PRO_KEY) === "true";
}

export default function InterviewPage() {
  const router = useRouter();
  const [pro, setPro] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState("behavioral");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    setPro(isPro());
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

  const handleAsk = async () => {
    if (!isPro()) {
      setShowUpgrade(true);
      return;
    }

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

    if (!question.trim() || question.trim().length < 2) {
      setError("Please enter a question.");
      return;
    }

    setError("");
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: text,
          jobTitle: jobTitle.trim(),
          jobDescription: jobDescription.trim(),
          question: question.trim(),
          mode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get answer.");

      setResult(data);
      setSavedQuestions((prev) => {
        const updated = [{ q: question.trim(), mode, result: data }, ...prev];
        return updated.slice(0, 20);
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    handleAsk();
  };

  const sampleQuestions = {
    behavioral: [
      "Tell me about a time you led a difficult project.",
      "Describe a conflict you resolved within your team.",
      "Give an example of a goal you didn't meet and how you handled it.",
      "Tell me about a time you had to learn something new quickly.",
    ],
    technical: [
      "Explain how you would design a URL shortening service.",
      "What's the difference between REST and GraphQL?",
      "How would you optimize a slow database query?",
      "Explain the event loop in JavaScript.",
    ],
    general: [
      "Why do you want to work here?",
      "What are your greatest strengths and weaknesses?",
      "Where do you see yourself in five years?",
      "Tell me about yourself.",
    ],
  };

  return (
    <div className="relative z-[1] min-h-screen py-16 px-8">
      <div className="max-w-[720px] mx-auto">
        <div className="text-center mb-10">
          <div className={`font-mono text-[12px] tracking-[0.06em] uppercase flex items-center justify-center gap-2 mb-4 ${pro ? "text-[var(--green)]" : "text-[var(--coral-dark)]"}`}>
            <span className={`w-[6px] h-[6px] rounded-full animate-pulse-dot ${pro ? "bg-[var(--green)]" : "bg-[var(--coral)]"}`}></span>
            {pro ? "Pro feature — full access" : "Pro feature"}
            {!pro && (
              <button onClick={() => { localStorage.setItem(PRO_KEY, "true"); window.location.reload(); }} className="font-mono text-[10px] text-[var(--coral)] hover:text-[var(--coral-dark)] underline ml-1">
                Enable Pro (dev)
              </button>
            )}
          </div>
          <h1 className="font-serif font-[500] text-[clamp(32px,4vw,42px)] leading-[1.1] text-[var(--ink)]">
            Interview Q&A Coach
          </h1>
          <p className="text-[var(--ink-soft)] text-[17px] mt-3">
            Practice with AI-powered answers tailored to your resume and target role. Behavioral, technical, or general — get strategic responses with key talking points.
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
              Resume Text <span className="text-[var(--ink-soft)] font-normal">(optional — for tailored answers)</span>
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here for more personalized responses..."
              rows={4}
              className="w-full px-4 py-3 border border-[var(--line)] rounded-[3px] focus:outline-none focus:border-[var(--ink)] transition-colors text-[var(--ink)] bg-transparent resize-none font-mono text-[13px]"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ink-soft)] mb-1">
                Target Role
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
                Job Description <span className="text-[var(--ink-soft)] font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste key requirements..."
                className="w-full px-4 py-2.5 border border-[var(--line)] rounded-[3px] focus:outline-none focus:border-[var(--ink)] transition-colors text-[var(--ink)] bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--ink-soft)] mb-3">
              Question Type
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setMode("behavioral")}
                className={`flex-1 font-mono text-[13px] py-3 px-4 rounded-[3px] transition-all flex items-center justify-center gap-2 ${
                  mode === "behavioral"
                    ? "bg-[var(--ink)] text-white"
                    : "bg-[var(--paper-card)] border border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink)]"
                }`}
              >
                <Lightbulb className="w-4 h-4" /> Behavioral
              </button>
              <button
                onClick={() => setMode("technical")}
                className={`flex-1 font-mono text-[13px] py-3 px-4 rounded-[3px] transition-all flex items-center justify-center gap-2 ${
                  mode === "technical"
                    ? "bg-[var(--ink)] text-white"
                    : "bg-[var(--paper-card)] border border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink)]"
                }`}
              >
                <Code className="w-4 h-4" /> Technical
              </button>
              <button
                onClick={() => setMode("general")}
                className={`flex-1 font-mono text-[13px] py-3 px-4 rounded-[3px] transition-all flex items-center justify-center gap-2 ${
                  mode === "general"
                    ? "bg-[var(--ink)] text-white"
                    : "bg-[var(--paper-card)] border border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink)]"
                }`}
              >
                <MessageSquare className="w-4 h-4" /> General
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--ink-soft)] mb-2">
              Your Question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={mode === "behavioral" ? "e.g., Tell me about a time you led a team through a difficult project..." : mode === "technical" ? "e.g., How would you design a rate limiter?" : "e.g., Why do you want to work here?"}
              rows={3}
              className="w-full px-4 py-3 border border-[var(--line)] rounded-[3px] focus:outline-none focus:border-[var(--ink)] transition-colors text-[var(--ink)] bg-transparent resize-none"
            />
          </div>

          {question.trim().length < 2 && (
            <div>
              <p className="text-xs text-[var(--ink-soft)] mb-2 font-mono uppercase tracking-[0.05em]">
                Try a sample question:
              </p>
              <div className="flex flex-wrap gap-2">
                {sampleQuestions[mode].map((sq, i) => (
                  <button
                    key={i}
                    onClick={() => setQuestion(sq)}
                    className="font-mono text-[11px] bg-[var(--line)] text-[var(--ink)] px-3 py-1.5 rounded-[2px] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-all"
                  >
                    {sq.length > 40 ? sq.substring(0, 40) + "..." : sq}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 bg-[var(--coral-light)] border border-[var(--coral)] rounded-[3px] p-4 text-[var(--coral-dark)] text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleAsk}
            disabled={isLoading}
            className={`w-full font-mono text-[14px] font-medium rounded-[3px] transition-all flex items-center justify-center gap-2 py-[15px] ${
              isLoading
                ? "bg-[var(--line)] text-[var(--ink-soft)] cursor-not-allowed"
                : "bg-[var(--coral)] text-white shadow-[3px_3px_0_var(--coral-dark)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_var(--coral-dark)]"
            }`}
          >
            {isLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Preparing your answer...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Ask the Coach</>
            )}
          </button>
        </div>

        {result && (
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <span className="font-mono text-[12px] tracking-[0.06em] text-[var(--green)] uppercase block mb-2">
                Coach Answer Ready
              </span>
              <h2 className="font-serif font-[500] text-[clamp(20px,2.5vw,26px)] text-[var(--ink)]">
                {result.question?.length > 60 ? result.question.substring(0, 60) + "..." : result.question}
              </h2>
            </div>

            {result.type === "behavioral" && result.starResponse && (
              <div className="bg-[var(--paper-card)] border border-[var(--ink)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-8">
                <h3 className="font-mono text-[11px] text-[var(--ink-soft)] uppercase tracking-[0.05em] mb-4">STAR Response</h3>
                <div className="space-y-4">
                  {result.starResponse.situation && (
                    <div className="border-l-4 border-[var(--coral)] pl-4">
                      <span className="font-mono text-[10px] text-[var(--coral)] uppercase tracking-[0.05em] block mb-1">Situation</span>
                      <p className="text-sm text-[var(--ink)]">{result.starResponse.situation}</p>
                    </div>
                  )}
                  {result.starResponse.task && (
                    <div className="border-l-4 border-[var(--coral)] pl-4">
                      <span className="font-mono text-[10px] text-[var(--coral)] uppercase tracking-[0.05em] block mb-1">Task</span>
                      <p className="text-sm text-[var(--ink)]">{result.starResponse.task}</p>
                    </div>
                  )}
                  {result.starResponse.action && (
                    <div className="border-l-4 border-[var(--green)] pl-4">
                      <span className="font-mono text-[10px] text-[var(--green)] uppercase tracking-[0.05em] block mb-1">Action</span>
                      <p className="text-sm text-[var(--ink)]">{result.starResponse.action}</p>
                    </div>
                  )}
                  {result.starResponse.result && (
                    <div className="border-l-4 border-[var(--green)] pl-4">
                      <span className="font-mono text-[10px] text-[var(--green)] uppercase tracking-[0.05em] block mb-1">Result</span>
                      <p className="text-sm text-[var(--ink)]">{result.starResponse.result}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {result.fullAnswer && (
              <div className="bg-[var(--green-light)] border border-[var(--green)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-8">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--green)]/30">
                  <h3 className="font-mono text-[11px] text-[var(--green)] uppercase tracking-[0.05em]">Polished Answer</h3>
                  <span className="font-mono text-[10px] text-[var(--green)]/60">
                    ~{result.fullAnswer.split(" ").length} words
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-[15px] text-[var(--ink)] leading-relaxed">
                  {result.fullAnswer || result.answer}
                </p>
                <div className="mt-6 pt-4 border-t border-[var(--green)]/30 flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => handleCopy(result.fullAnswer || result.answer)}
                    className="font-mono text-[12px] bg-[var(--green)] text-white px-5 py-2.5 rounded-[3px] hover:bg-[var(--green)]/80 transition-all flex items-center gap-2"
                  >
                    {copied ? <><CheckCircle className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy Answer</>}
                  </button>
                  <button
                    onClick={handleRegenerate}
                    disabled={isLoading}
                    className="font-mono text-[12px] bg-[var(--paper-card)] text-[var(--ink)] border border-[var(--line)] px-5 py-2.5 rounded-[3px] hover:bg-[var(--line)] transition-all flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Regenerate
                  </button>
                </div>
              </div>
            )}

            {result.answer && !result.fullAnswer && (
              <div className="bg-[var(--green-light)] border border-[var(--green)] shadow-[6px_6px_0_rgba(22,33,61,0.08)] p-8">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--green)]/30">
                  <h3 className="font-mono text-[11px] text-[var(--green)] uppercase tracking-[0.05em]">Answer</h3>
                  <span className="font-mono text-[10px] text-[var(--green)]/60">
                    ~{result.answer.split(" ").length} words
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-[15px] text-[var(--ink)] leading-relaxed">
                  {result.answer}
                </p>
                <div className="mt-6 pt-4 border-t border-[var(--green)]/30 flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => handleCopy(result.answer)}
                    className="font-mono text-[12px] bg-[var(--green)] text-white px-5 py-2.5 rounded-[3px] hover:bg-[var(--green)]/80 transition-all flex items-center gap-2"
                  >
                    {copied ? <><CheckCircle className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy Answer</>}
                  </button>
                  <button
                    onClick={handleRegenerate}
                    disabled={isLoading}
                    className="font-mono text-[12px] bg-[var(--paper-card)] text-[var(--ink)] border border-[var(--line)] px-5 py-2.5 rounded-[3px] hover:bg-[var(--line)] transition-all flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Regenerate
                  </button>
                </div>
              </div>
            )}

            {(result.keyPoints?.length > 0 || result.tips?.length > 0) && (
              <div className="grid md:grid-cols-2 gap-6">
                {result.keyPoints?.length > 0 && (
                  <div className="bg-[var(--paper-card)] border border-[var(--line)] p-6 rounded-[3px]">
                    <h4 className="font-mono text-[11px] text-[var(--ink-soft)] uppercase tracking-[0.05em] mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-[var(--coral)]" /> Key Points
                    </h4>
                    <ul className="space-y-2">
                      {result.keyPoints.map((kp, i) => (
                        <li key={i} className="text-sm text-[var(--ink)] flex items-start gap-2">
                          <span className="text-[var(--coral)] mt-0.5">•</span>
                          {kp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.tips?.length > 0 && (
                  <div className="bg-[var(--paper-card)] border border-[var(--line)] p-6 rounded-[3px]">
                    <h4 className="font-mono text-[11px] text-[var(--ink-soft)] uppercase tracking-[0.05em] mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[var(--green)]" /> Tips
                    </h4>
                    <ul className="space-y-2">
                      {result.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-[var(--ink)] flex items-start gap-2">
                          <span className="text-[var(--green)] mt-0.5">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {result.followUpQuestions?.length > 0 && (
              <div className="bg-[var(--paper-card)] border border-[var(--line)] p-6 rounded-[3px]">
                <h4 className="font-mono text-[11px] text-[var(--ink-soft)] uppercase tracking-[0.05em] mb-3">Follow-Up Questions to Practice</h4>
                <div className="flex flex-wrap gap-2">
                  {result.followUpQuestions.map((fq, i) => (
                    <button
                      key={i}
                      onClick={() => setQuestion(fq)}
                      className="font-mono text-[11px] bg-[var(--line)] text-[var(--ink)] px-3 py-1.5 rounded-[2px] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-all"
                    >
                      {fq.length > 50 ? fq.substring(0, 50) + "..." : fq}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {savedQuestions.length > 0 && (
          <div className="mt-10">
            <h3 className="font-serif font-[500] text-[18px] text-[var(--ink)] mb-4 text-center">Question History</h3>
            <div className="space-y-2">
              {savedQuestions.map((item, i) => (
                <button
                  key={i}
                  onClick={() => { setQuestion(item.q); setMode(item.mode); setResult(item.result); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="w-full text-left bg-[var(--paper-card)] border border-[var(--line)] p-4 rounded-[3px] hover:border-[var(--ink)] transition-all"
                >
                  <span className="font-mono text-[10px] text-[var(--ink-soft)] uppercase block mb-1">
                    {item.mode}
                  </span>
                  <p className="text-sm text-[var(--ink)]">{item.q}</p>
                </button>
              ))}
            </div>
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
            <p className="text-[var(--ink-soft)] text-center mb-6">Interview Q&A Coach is a Pro feature. Upgrade to practice with AI-powered answers tailored to your resume and target role — behavioral STAR responses, technical deep dives, and more.</p>
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

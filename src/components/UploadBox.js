"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, File } from "lucide-react";

export default function UploadBox({ file, onFileSelect, onFileRemove }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  const getFileIcon = () => {
    if (!file) return null;
    return file.type === "application/pdf" ? (
      <FileText className="w-8 h-8 text-[var(--coral)]" />
    ) : (
      <File className="w-8 h-8 text-[var(--ink-soft)]" />
    );
  };

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-[3px] p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
        isDragActive
          ? "border-[var(--coral)] bg-[var(--coral-light)] scale-[1.02]"
          : file
          ? "border-[var(--green)] bg-[var(--green-light)]"
          : "border-[var(--line)] bg-[var(--paper-card)] hover:border-[var(--ink-soft)] hover:bg-[var(--line)]"
      }`}
    >
      <input {...getInputProps()} />

      {file ? (
        <div className="relative">
          <div className="flex items-center justify-center gap-3 max-sm:flex-col max-sm:text-center">
            {getFileIcon()}
            <div className="text-left max-sm:text-center max-w-full min-w-0">
              <p className="font-medium text-[var(--ink)] text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">{file.name}</p>
              <p className="text-sm text-[var(--ink-soft)]">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileRemove();
              }}
              className="p-1 hover:bg-[var(--coral-light)] rounded-full transition-colors shrink-0"
              aria-label="Remove file"
            >
              <X className="w-5 h-5 text-[var(--coral)]" />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 bg-[var(--coral-light)] rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--coral)]" />
          </div>
          <p className="font-mono text-[13px] sm:text-[14px] font-medium text-[var(--ink)] mb-2">
            {isDragActive
              ? "Drop your resume here..."
              : "Drag & drop your resume here"}
          </p>
          <p className="text-[var(--ink-soft)] mb-4 text-sm">or</p>
          <span className="inline-block bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white px-5 sm:px-6 py-3 sm:py-[15px] rounded-[3px] shadow-[3px_3px_0_var(--coral-dark)] font-mono text-[13px] sm:text-[14px] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]">
            Browse Files
          </span>
          <p className="font-mono text-[11px] text-[var(--ink-soft)] mt-4">
            Supports: <strong>PDF</strong>, DOC, DOCX
          </p>
          <p className="font-mono text-[11px] text-[var(--ink-soft)]">Max size: 5MB</p>
        </div>
      )}
    </div>
  );
}

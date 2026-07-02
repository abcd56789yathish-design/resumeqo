// ============================================
// UPLOAD BOX - Drag & drop file upload area
// ============================================
// Uses react-dropzone to handle file uploads via
// drag-and-drop or click-to-browse.
// Supports PDF, DOC, and DOCX files (max 5MB).

"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, File } from "lucide-react";

export default function UploadBox({ file, onFileSelect, onFileRemove }) {
  // Called when a file is dropped or selected via browse
  const onDrop = useCallback(
    (acceptedFiles) => {
      // Take the first file only (if multiple are dropped)
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  // Configure react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB max file size
    multiple: false, // Only one file at a time
  });

  // Get file icon based on type
  const getFileIcon = () => {
    if (!file) return null;
    const isPDF = file.type === "application/pdf";
    return isPDF ? (
      <FileText className="w-8 h-8 text-green-500" />
    ) : (
      <File className="w-8 h-8 text-blue-500" />
    );
  };

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
        isDragActive
          ? "border-blue-500 bg-blue-50 scale-[1.02]" // Active drag state
          : file
          ? "border-green-400 bg-green-50" // File selected state
          : "border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50" // Default state
      }`}
    >
      <input {...getInputProps()} />

      {file ? (
        // Show this when a file is already selected
        <div className="relative">
          <div className="flex items-center justify-center gap-3">
            {getFileIcon()}
            <div className="text-left">
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            {/* Remove file button */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent dropzone from opening
                onFileRemove();
              }}
              className="p-1 hover:bg-red-100 rounded-full transition-colors"
              aria-label="Remove file"
            >
              <X className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>
      ) : (
        // Show this when no file is selected (default upload UI)
        <div>
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">
            {isDragActive
              ? "Drop your resume here..."
              : "Drag & drop your resume here"}
          </p>
          <p className="text-gray-500 mb-4">or</p>
          <span className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors font-medium">
            Browse Files
          </span>
          <p className="text-sm text-gray-400 mt-4">
            Supports: <strong>PDF</strong>, DOC, DOCX
          </p>
          <p className="text-sm text-gray-400">Max size: 5MB</p>
        </div>
      )}
    </div>
  );
}

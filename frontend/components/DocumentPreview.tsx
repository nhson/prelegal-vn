"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  markdown: string;
  pdfFilename: string;
  hasContent: boolean;
  onSave?: () => Promise<void>;
  canSave?: boolean;
}

export default function DocumentPreview({ markdown, pdfFilename, hasContent, onSave, canSave }: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const handleDownloadPDF = async () => {
    const el = previewRef.current;
    if (!el) return;
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: [15, 15, 15, 15],
          filename: pdfFilename,
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(el)
        .save();
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF download failed. Please try again.");
    }
  };

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    setSaved(false);
    setSaveError(false);
    try {
      await onSave();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaveError(true);
      setTimeout(() => setSaveError(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50 shrink-0">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Live Preview
        </span>
        <div className="flex items-center gap-2">
          {onSave && (
            <button
              onClick={handleSave}
              disabled={!canSave || saving}
              aria-label="Save document to account"
              className="flex items-center gap-1.5 rounded-md bg-[#ecad0a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#d49a08] active:bg-[#bb8807] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saved ? "✓ Saved" : saving ? "Saving…" : saveError ? "✕ Error" : "Save"}
            </button>
          )}
          <button
            onClick={handleDownloadPDF}
            disabled={!hasContent}
            aria-label="Download document as PDF"
            className="flex items-center gap-1.5 rounded-md bg-[#209dd7] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a7dac] active:bg-[#156890] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div
          ref={previewRef}
          className="prose prose-sm max-w-none prose-headings:font-bold prose-h1:text-xl prose-h2:text-base prose-h3:text-sm prose-table:text-xs"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

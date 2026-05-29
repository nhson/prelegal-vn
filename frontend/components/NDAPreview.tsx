"use client";

import { useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { NDAFormData } from "@/lib/nda-template";

interface Props {
  markdown: string;
  data: NDAFormData;
}

export default function NDAPreview({ markdown, data }: Props) {
  const previewRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    const el = previewRef.current;
    if (!el) return;
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const filename = `Mutual-NDA_${(data.party1Company || "Party1").replace(/\s+/g, "-")}_${(data.party2Company || "Party2").replace(/\s+/g, "-")}.pdf`;
      await html2pdf()
        .set({
          margin: [15, 15, 15, 15],
          filename,
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

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50 shrink-0">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Live Preview
        </span>
        <button
          onClick={handleDownloadPDF}
          aria-label="Download NDA as PDF"
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </button>
      </div>

      {/* Document */}
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

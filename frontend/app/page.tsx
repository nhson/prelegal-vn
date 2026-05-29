"use client";

import { useState } from "react";
import NDAForm from "@/components/NDAForm";
import NDAPreview from "@/components/NDAPreview";
import { defaultFormData, generateNDA, NDAFormData } from "@/lib/nda-template";

export default function Home() {
  const [formData, setFormData] = useState<NDAFormData>(defaultFormData);
  const markdown = generateNDA(formData);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">Prelegal</span>
          <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
            Prototype
          </span>
        </div>
        <span className="text-sm text-gray-500">Mutual NDA Creator</span>
      </header>

      {/* Split view */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — Form */}
        <div className="w-[420px] shrink-0 border-r border-gray-200 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Fill in Details
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <NDAForm data={formData} onChange={setFormData} />
          </div>
        </div>

        {/* Right — Live Preview */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <NDAPreview markdown={markdown} data={formData} />
        </div>
      </div>
    </div>
  );
}

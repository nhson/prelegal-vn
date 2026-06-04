"use client";

import { useState, useMemo } from "react";
import ChatPanel from "@/components/ChatPanel";
import NDAPreview from "@/components/NDAPreview";
import { defaultFormData, generateNDA, NDAFormData } from "@/lib/nda-template";

export default function Home() {
  const [formData, setFormData] = useState<NDAFormData>(defaultFormData);
  const markdown = useMemo(() => generateNDA(formData), [formData]);

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">Prelegal</span>
          <span className="text-xs bg-[#209dd7] text-white font-semibold px-2 py-0.5 rounded-full">
            Beta
          </span>
        </div>
        <span className="text-sm text-gray-500">Mutual NDA Creator</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[420px] shrink-0 border-r border-gray-200 flex flex-col">
          <ChatPanel onFieldsUpdate={setFormData} />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <NDAPreview markdown={markdown} data={formData} />
        </div>
      </div>
    </div>
  );
}

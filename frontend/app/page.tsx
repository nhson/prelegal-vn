"use client";

import { useState, useMemo, useCallback } from "react";
import ChatPanel from "@/components/ChatPanel";
import DocumentPreview from "@/components/DocumentPreview";
import { defaultFormData, generateNDA, NDAFormData } from "@/lib/nda-template";
import { generateGenericPreview } from "@/lib/document-preview";
import { getDocName } from "@/lib/catalog";

interface DocumentState {
  docType: string | null;
  fields: Record<string, string>;
}

function toNDAFormData(fields: Record<string, string>): NDAFormData {
  const today = new Date().toISOString().split("T")[0];
  const termType = fields.mndaTermType;
  const confType = fields.confidentialityTermType;
  return {
    ...defaultFormData,
    party1Name: fields.party1Name ?? "",
    party1Title: fields.party1Title ?? "",
    party1Company: fields.party1Company ?? "",
    party1Address: fields.party1Address ?? "",
    party2Name: fields.party2Name ?? "",
    party2Title: fields.party2Title ?? "",
    party2Company: fields.party2Company ?? "",
    party2Address: fields.party2Address ?? "",
    purpose: fields.purpose ?? "",
    effectiveDate: fields.effectiveDate ?? today,
    mndaTermType: termType === "until_terminated" ? "until_terminated" : "years",
    mndaTermYears: fields.mndaTermYears ?? "1",
    confidentialityTermType: confType === "perpetuity" ? "perpetuity" : "years",
    confidentialityTermYears: fields.confidentialityTermYears ?? "1",
    governingLaw: fields.governingLaw ?? "",
    jurisdiction: fields.jurisdiction ?? "",
    modifications: fields.modifications ?? "",
  };
}

function getPdfFilename(docType: string | null, fields: Record<string, string>): string {
  const name = getDocName(docType).replace(/\s+/g, "-");
  const p1 = (
    fields.party1Company ??
    fields.providerName ??
    fields.companyName ??
    "Party1"
  ).replace(/\s+/g, "-");
  const p2 = (
    fields.party2Company ??
    fields.customerName ??
    fields.partnerName ??
    "Party2"
  ).replace(/\s+/g, "-");
  return `${name}_${p1}_${p2}.pdf`;
}

export default function Home() {
  const [docState, setDocState] = useState<DocumentState>({ docType: null, fields: {} });

  const handleDocumentUpdate = useCallback(
    (docType: string | null, fields: Record<string, string>) => {
      setDocState((prev) => {
        const resolvedType = docType ?? prev.docType;
        // Reset accumulated fields when the document type changes
        const mergedFields =
          resolvedType !== prev.docType
            ? { ...fields }
            : { ...prev.fields, ...fields };
        return { docType: resolvedType, fields: mergedFields };
      });
    },
    []
  );

  const markdown = useMemo(() => {
    const { docType, fields } = docState;
    if (docType === "mutual-nda") {
      return generateNDA(toNDAFormData(fields));
    }
    return generateGenericPreview(getDocName(docType), fields);
  }, [docState]);

  const pdfFilename = useMemo(
    () => getPdfFilename(docState.docType, docState.fields),
    [docState]
  );

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">Prelegal</span>
          <span className="text-xs bg-[#209dd7] text-white font-semibold px-2 py-0.5 rounded-full">
            Beta
          </span>
        </div>
        <span className="text-sm text-gray-500">
          {docState.docType ? getDocName(docState.docType) : "Legal Document Creator"}
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[420px] shrink-0 border-r border-gray-200 flex flex-col">
          <ChatPanel
            documentType={docState.docType}
            onDocumentUpdate={handleDocumentUpdate}
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <DocumentPreview
            markdown={markdown}
            pdfFilename={pdfFilename}
            hasContent={Object.keys(docState.fields).length > 0}
          />
        </div>
      </div>
    </div>
  );
}

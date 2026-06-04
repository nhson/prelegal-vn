"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import ChatPanel from "@/components/ChatPanel";
import DocumentPreview from "@/components/DocumentPreview";
import AuthModal from "@/components/AuthModal";
import UserMenu from "@/components/UserMenu";
import MyDocumentsModal from "@/components/MyDocumentsModal";
import { defaultFormData, generateNDA, NDAFormData } from "@/lib/nda-template";
import { generateGenericPreview } from "@/lib/document-preview";
import { getDocName } from "@/lib/catalog";
import { useAuth } from "@/lib/auth-context";

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

function generateDocTitle(docType: string | null, fields: Record<string, string>): string {
  const docName = getDocName(docType);
  const p1 = fields.party1Company ?? fields.providerName ?? fields.companyName ?? "";
  const p2 = fields.party2Company ?? fields.customerName ?? fields.partnerName ?? "";
  if (p1 && p2) return `${docName} – ${p1} & ${p2}`;
  if (p1) return `${docName} – ${p1}`;
  const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${docName} – ${date}`;
}

function getPdfFilename(docType: string | null, fields: Record<string, string>): string {
  const name = getDocName(docType).replace(/\s+/g, "-");
  const p1 = (fields.party1Company ?? fields.providerName ?? fields.companyName ?? "Party1").replace(/\s+/g, "-");
  const p2 = (fields.party2Company ?? fields.customerName ?? fields.partnerName ?? "Party2").replace(/\s+/g, "-");
  return `${name}_${p1}_${p2}.pdf`;
}

export default function Home() {
  const { user } = useAuth();
  const [docState, setDocState] = useState<DocumentState>({ docType: null, fields: {} });
  const [resetKey, setResetKey] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [showMyDocs, setShowMyDocs] = useState(false);
  // Track the saved document id so subsequent saves use PUT instead of POST
  const savedDocIdRef = useRef<number | null>(null);

  const hasContent = Object.keys(docState.fields).length > 0;

  const handleDocumentUpdate = useCallback(
    (docType: string | null, fields: Record<string, string>) => {
      setDocState((prev) => {
        const resolvedType = docType ?? prev.docType;
        const mergedFields =
          resolvedType !== prev.docType
            ? { ...fields }
            : { ...prev.fields, ...fields };
        return { docType: resolvedType, fields: mergedFields };
      });
    },
    []
  );

  const handleNewDocument = useCallback(() => {
    setDocState({ docType: null, fields: {} });
    savedDocIdRef.current = null;
    setResetKey((k) => k + 1);
  }, []);

  const handleLoadDocument = useCallback((docType: string, fields: Record<string, string>) => {
    setDocState({ docType, fields });
    savedDocIdRef.current = null;
    setResetKey((k) => k + 1);
  }, []);

  const handleSave = useCallback(async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (!docState.docType || !hasContent) return;

    const body = JSON.stringify({
      title: generateDocTitle(docState.docType, docState.fields),
      document_type: docState.docType,
      fields: docState.fields,
    });

    let res: Response;
    const existingId = savedDocIdRef.current;
    if (existingId) {
      res = await fetch(`/api/documents/${existingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body,
      });
    } else {
      res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { detail?: string }).detail ?? "Save failed");
    }

    const data = await res.json();
    savedDocIdRef.current = data.id;
  }, [user, docState, hasContent]);

  const markdown = useMemo(() => {
    const { docType, fields } = docState;
    if (docType === "mutual-nda") return generateNDA(toNDAFormData(fields));
    return generateGenericPreview(getDocName(docType), fields);
  }, [docState]);

  const pdfFilename = useMemo(() => getPdfFilename(docState.docType, docState.fields), [docState]);

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold" style={{ color: "#032147" }}>Prelegal</span>
            <span className="text-xs bg-[#209dd7] text-white font-semibold px-2 py-0.5 rounded-full">Beta</span>
          </div>
          <button
            onClick={handleNewDocument}
            className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-md px-2.5 py-1 transition-colors"
          >
            New Document
          </button>
        </div>

        <span className="text-sm text-gray-500 truncate mx-4">
          {docState.docType ? getDocName(docState.docType) : "Legal Document Creator"}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <UserMenu onMyDocuments={() => setShowMyDocs(true)} />
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="text-xs font-semibold text-[#209dd7] hover:text-[#1a7dac] border border-[#209dd7] rounded-lg px-3 py-1.5 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[420px] shrink-0 border-r border-gray-200 flex flex-col">
          <ChatPanel
            documentType={docState.docType}
            onDocumentUpdate={handleDocumentUpdate}
            resetKey={resetKey}
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <DocumentPreview
            markdown={markdown}
            pdfFilename={pdfFilename}
            hasContent={hasContent}
            onSave={handleSave}
            canSave={hasContent}
          />
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showMyDocs && (
        <MyDocumentsModal
          onClose={() => setShowMyDocs(false)}
          onLoad={handleLoadDocument}
        />
      )}
    </div>
  );
}

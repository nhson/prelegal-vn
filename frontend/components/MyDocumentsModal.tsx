"use client";

import { useState, useEffect, useCallback } from "react";
import { getDocName } from "@/lib/catalog";

interface SavedDoc {
  id: number;
  title: string;
  document_type: string;
  updated_at: string;
}

interface Props {
  onClose: () => void;
  onLoad: (docType: string, fields: Record<string, string>) => void;
}

export default function MyDocumentsModal({ onClose, onLoad }: Props) {
  const [docs, setDocs] = useState<SavedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        setDocs(await res.json());
      } else {
        setError("Could not load documents. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleLoad = async (id: number, docType: string) => {
    const res = await fetch(`/api/documents/${id}`);
    if (!res.ok) {
      setError("Could not load this document. Please try again.");
      return;
    }
    const data = await res.json();
    onLoad(docType, data.fields ?? {});
    onClose();
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDocs((prev) => prev.filter((d) => d.id !== id));
      } else {
        setError("Could not delete this document. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-bold" style={{ color: "#032147" }}>My Documents</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        {error && (
          <div className="mx-6 mt-4 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-gray-400">Loading…</div>
          ) : docs.length === 0 && !error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <span className="text-2xl">📄</span>
              <p className="text-sm text-gray-500">No saved documents yet.</p>
              <p className="text-xs text-gray-400">Create a document and click Save to store it here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {docs.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium text-gray-900 truncate">{doc.title}</span>
                    <span className="text-xs text-gray-400">
                      {getDocName(doc.document_type)} · {formatDate(doc.updated_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <button
                      onClick={() => handleLoad(doc.id, doc.document_type)}
                      className="text-xs font-semibold text-[#209dd7] hover:text-[#1a7dac] border border-[#209dd7] rounded-md px-3 py-1 transition-colors"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deletingId === doc.id}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 rounded-md px-3 py-1 transition-colors disabled:opacity-40"
                    >
                      {deletingId === doc.id ? "…" : "Delete"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

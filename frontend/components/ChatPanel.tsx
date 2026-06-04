"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

interface FieldValue {
  key: string;
  value?: string | null;
}

interface AIResponse {
  reply: string;
  documentType?: string | null;
  fields: FieldValue[];
}

interface Props {
  documentType: string | null;
  onDocumentUpdate: (docType: string | null, fields: Record<string, string>) => void;
  resetKey?: number;
}

function useMessageFactory() {
  const nextId = useRef(0);
  return (role: "user" | "assistant", content: string): Message => ({
    id: nextId.current++,
    role,
    content,
  });
}

function toApiMessages(msgs: Message[]) {
  return msgs.map(({ role, content }) => ({ role, content }));
}

export default function ChatPanel({ documentType, onDocumentUpdate, resetKey = 0 }: Props) {
  const makeMessage = useMessageFactory();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages([]);
    setInput("");
    fetch("/api/chat/greeting")
      .then((r) => r.json())
      .then((data: { message: string }) => {
        setMessages([makeMessage("assistant", data.message)]);
      })
      .catch(() => {
        setMessages([makeMessage("assistant", "Hi! What type of legal document can I help you create today?")]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = makeMessage("user", text);
    const outgoing = [...messages, userMsg];

    setMessages(outgoing);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: toApiMessages(outgoing),
          documentType: documentType ?? null,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: AIResponse = await res.json();
      setMessages((prev) => [...prev, makeMessage("assistant", data.reply)]);

      const fieldRecord: Record<string, string> = {};
      for (const { key, value } of data.fields ?? []) {
        if (value !== null && value !== undefined && value !== "") {
          fieldRecord[key] = value;
        }
      }
      onDocumentUpdate(data.documentType ?? null, fieldRecord);
    } catch {
      setMessages((prev) => [
        ...prev,
        makeMessage("assistant", "Sorry, something went wrong. Please try again."),
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [input, loading, messages, documentType, onDocumentUpdate]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          AI Assistant
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[#753991] text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce dot-delay-0" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce dot-delay-1" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce dot-delay-2" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-gray-200 px-4 py-3 bg-white">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
            rows={2}
            className="flex-1 resize-none rounded-xl border border-gray-500 bg-white text-gray-900 placeholder:text-gray-500 px-3 py-2 text-sm focus:border-[#209dd7] focus:outline-none focus:ring-2 focus:ring-[#209dd7]"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="rounded-xl bg-[#753991] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5d2c72] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 self-end"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

interface Props {
  onMyDocuments: () => void;
}

export default function UserMenu({ onMyDocuments }: Props) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const displayEmail = user.email.length > 22 ? user.email.slice(0, 20) + "…" : user.email;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
      >
        <span className="w-5 h-5 rounded-full bg-[#209dd7] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
          {user.email[0].toUpperCase()}
        </span>
        {displayEmail}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-40">
          <button
            onClick={() => { setOpen(false); onMyDocuments(); }}
            className="w-full text-left text-sm px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            My Documents
          </button>
          <div className="my-1 border-t border-gray-100" />
          <button
            onClick={() => { setOpen(false); signOut(); }}
            className="w-full text-left text-sm px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

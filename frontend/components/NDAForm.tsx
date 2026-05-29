"use client";

import { NDAFormData } from "@/lib/nda-template";

interface Props {
  data: NDAFormData;
  onChange: (data: NDAFormData) => void;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
      />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold text-gray-700 border-b border-gray-100 pb-1 mt-4 mb-3">
      {children}
    </h3>
  );
}

export default function NDAForm({ data, onChange }: Props) {
  const set = (key: keyof NDAFormData) => (value: string) =>
    onChange({ ...data, [key]: value });

  return (
    <div className="flex flex-col gap-3 text-sm">
      {/* Parties */}
      <SectionTitle>Party 1</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Full Name" value={data.party1Name} onChange={set("party1Name")} placeholder="Jane Smith" />
        <Field label="Title" value={data.party1Title} onChange={set("party1Title")} placeholder="CEO" />
      </div>
      <Field label="Company" value={data.party1Company} onChange={set("party1Company")} placeholder="Acme Corp" />
      <Field label="Notice Address" value={data.party1Address} onChange={set("party1Address")} placeholder="jane@acme.com" />

      <SectionTitle>Party 2</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Full Name" value={data.party2Name} onChange={set("party2Name")} placeholder="John Doe" />
        <Field label="Title" value={data.party2Title} onChange={set("party2Title")} placeholder="CTO" />
      </div>
      <Field label="Company" value={data.party2Company} onChange={set("party2Company")} placeholder="Globex Inc" />
      <Field label="Notice Address" value={data.party2Address} onChange={set("party2Address")} placeholder="john@globex.com" />

      {/* Agreement Terms */}
      <SectionTitle>Agreement Terms</SectionTitle>
      <TextArea
        label="Purpose"
        value={data.purpose}
        onChange={set("purpose")}
        placeholder="Evaluating whether to enter into a business relationship..."
        rows={2}
      />
      <Field label="Effective Date" value={data.effectiveDate} onChange={set("effectiveDate")} type="date" />

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          MNDA Term
        </label>
        <div className="flex gap-3">
          <label htmlFor="mnda-term-years" className="flex items-center gap-2 cursor-pointer">
            <input
              id="mnda-term-years"
              type="radio"
              checked={data.mndaTermType === "years"}
              onChange={() => onChange({ ...data, mndaTermType: "years" })}
              className="accent-blue-500"
            />
            <span className="text-sm">Expires after</span>
            <input
              type="number"
              min="1"
              value={data.mndaTermYears}
              onChange={(e) => onChange({ ...data, mndaTermYears: e.target.value, mndaTermType: "years" })}
              className="w-14 rounded border border-gray-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
            />
            <span className="text-sm">year(s)</span>
          </label>
          <label htmlFor="mnda-term-terminated" className="flex items-center gap-2 cursor-pointer">
            <input
              id="mnda-term-terminated"
              type="radio"
              checked={data.mndaTermType === "until_terminated"}
              onChange={() => onChange({ ...data, mndaTermType: "until_terminated" })}
              className="accent-blue-500"
            />
            <span className="text-sm">Until terminated</span>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Term of Confidentiality
        </label>
        <div className="flex gap-3">
          <label htmlFor="conf-term-years" className="flex items-center gap-2 cursor-pointer">
            <input
              id="conf-term-years"
              type="radio"
              checked={data.confidentialityTermType === "years"}
              onChange={() => onChange({ ...data, confidentialityTermType: "years" })}
              className="accent-blue-500"
            />
            <span className="text-sm">Expires after</span>
            <input
              type="number"
              min="1"
              value={data.confidentialityTermYears}
              onChange={(e) => onChange({ ...data, confidentialityTermYears: e.target.value, confidentialityTermType: "years" })}
              className="w-14 rounded border border-gray-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
            />
            <span className="text-sm">year(s)</span>
          </label>
          <label htmlFor="conf-term-perpetuity" className="flex items-center gap-2 cursor-pointer">
            <input
              id="conf-term-perpetuity"
              type="radio"
              checked={data.confidentialityTermType === "perpetuity"}
              onChange={() => onChange({ ...data, confidentialityTermType: "perpetuity" })}
              className="accent-blue-500"
            />
            <span className="text-sm">In perpetuity</span>
          </label>
        </div>
      </div>

      <SectionTitle>Jurisdiction</SectionTitle>
      <Field label="Governing Law (State)" value={data.governingLaw} onChange={set("governingLaw")} placeholder="Delaware" />
      <Field label="Jurisdiction" value={data.jurisdiction} onChange={set("jurisdiction")} placeholder="New Castle, DE" />

      <SectionTitle>Modifications (Optional)</SectionTitle>
      <TextArea
        label="Additional modifications to the standard terms"
        value={data.modifications}
        onChange={set("modifications")}
        placeholder="List any modifications..."
        rows={3}
      />
    </div>
  );
}

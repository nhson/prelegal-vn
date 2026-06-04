export interface CatalogEntry {
  slug: string;
  name: string;
  description: string;
}

export const CATALOG: CatalogEntry[] = [
  { slug: "mutual-nda", name: "Mutual Non-Disclosure Agreement", description: "A standard mutual NDA for two parties to share confidential information." },
  { slug: "cloud-service-agreement", name: "Cloud Service Agreement", description: "A standard agreement for SaaS software subscriptions." },
  { slug: "design-partner-agreement", name: "Design Partner Agreement", description: "An early-stage design partnership for pre-release software feedback." },
  { slug: "service-level-agreement", name: "Service Level Agreement", description: "Defines uptime commitments, response times, and service credits." },
  { slug: "professional-services-agreement", name: "Professional Services Agreement", description: "Governs consulting services delivery with statements of work." },
  { slug: "data-processing-agreement", name: "Data Processing Agreement", description: "Governs personal data processing under GDPR and privacy regulations." },
  { slug: "software-license-agreement", name: "Software License Agreement", description: "License for on-premise or installed software products." },
  { slug: "partnership-agreement", name: "Partnership Agreement", description: "Formalizes referral or reseller arrangements and joint go-to-market." },
  { slug: "pilot-agreement", name: "Pilot Agreement", description: "A short-term trial agreement for product evaluation." },
  { slug: "business-associate-agreement", name: "Business Associate Agreement", description: "HIPAA agreement governing protected health information (PHI)." },
  { slug: "ai-addendum", name: "AI Addendum", description: "Addendum addressing AI tool use, data, and compliance obligations." },
];

export function getDocName(slug: string | null): string {
  if (!slug) return "Legal Document";
  return CATALOG.find((d) => d.slug === slug)?.name ?? "Legal Document";
}

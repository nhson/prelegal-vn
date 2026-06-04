"""
Document type registry.

Each entry defines the slug, display name, description, and the ordered list of
fields the AI should collect. Field entries are strings of the form:
  "fieldKey: human-readable description for the AI system prompt"
"""

from typing import Optional

CATALOG: list[dict] = [
    {
        "slug": "mutual-nda",
        "name": "Mutual Non-Disclosure Agreement",
        "description": "A standard mutual NDA for two parties to share confidential information while restricting disclosure to third parties.",
        "fields": [
            "party1Name: full name of Party 1's signatory",
            "party1Title: job title of Party 1's signatory",
            "party1Company: Party 1's company name",
            "party1Address: Party 1's notice address (email or postal)",
            "party2Name: full name of Party 2's signatory",
            "party2Title: job title of Party 2's signatory",
            "party2Company: Party 2's company name",
            "party2Address: Party 2's notice address (email or postal)",
            "purpose: business purpose of the NDA (e.g. 'evaluating a potential partnership')",
            "effectiveDate: agreement start date in YYYY-MM-DD format",
            "mndaTermType: 'years' if it expires after N years, 'until_terminated' if it runs until cancelled",
            "mndaTermYears: number as string (e.g. '1') — only when mndaTermType is 'years'",
            "confidentialityTermType: 'years' if confidentiality expires, 'perpetuity' if it lasts forever",
            "confidentialityTermYears: number as string — only when confidentialityTermType is 'years'",
            "governingLaw: US state whose laws govern this agreement (e.g. 'Delaware')",
            "jurisdiction: courts for disputes (e.g. 'New Castle, DE')",
            "modifications: any special modifications to the standard terms (empty string if none)",
        ],
    },
    {
        "slug": "cloud-service-agreement",
        "name": "Cloud Service Agreement",
        "description": "A standard agreement for the purchase and use of cloud-hosted software (SaaS), covering subscription terms, data handling, and support.",
        "fields": [
            "providerName: Provider's company name",
            "customerName: Customer's company name",
            "effectiveDate: framework agreement start date in YYYY-MM-DD format",
            "orderDate: order form date in YYYY-MM-DD format",
            "subscriptionPeriod: duration of each subscription term (e.g. '12 months')",
            "nonRenewalNoticeDate: how far in advance non-renewal must be given (e.g. '30 days before end of Subscription Period')",
            "technicalSupport: description of support tier provided",
            "useLimitations: any usage restrictions or limits",
            "paymentProcess: how and when payment is made (e.g. 'annual invoice, Net 30')",
            "governingLaw: US state name",
            "chosenCourts: courts for disputes (e.g. 'courts of Delaware')",
            "generalCapAmount: liability cap (e.g. 'fees paid in the 12 months prior to the claim')",
            "dpa: reference to a Data Processing Agreement if applicable, or 'N/A'",
        ],
    },
    {
        "slug": "design-partner-agreement",
        "name": "Design Partner Agreement",
        "description": "An agreement for early-stage design partnerships where a vendor provides pre-release software in exchange for feedback.",
        "fields": [
            "providerName: Provider's company name",
            "partnerName: Partner's company name",
            "effectiveDate: agreement start date in YYYY-MM-DD format",
            "term: duration of the design partner program (e.g. '6 months')",
            "program: description of what the design partner program involves",
            "fees: fees if any, or 'No fees'",
            "governingLaw: US state name",
            "chosenCourts: courts for disputes",
            "noticeAddress: notice email or postal address",
        ],
    },
    {
        "slug": "service-level-agreement",
        "name": "Service Level Agreement",
        "description": "Defines uptime commitments, incident response times, and remedies (service credits) for a cloud service.",
        "fields": [
            "providerName: Provider's company name",
            "customerName: Customer's company name",
            "subscriptionPeriod: period this SLA covers",
            "targetUptime: uptime percentage commitment (e.g. '99.9%')",
            "targetResponseTime: support response time commitment (e.g. '4 business hours for P1 issues')",
            "supportChannel: support contact method (e.g. 'support@company.com' or 'in-app ticket')",
            "uptimeCredit: service credit formula for uptime failures (e.g. '10% of monthly fee per 0.1% below target')",
            "responseTimeCredit: credit formula for response time failures",
            "scheduledDowntime: maintenance window description (e.g. 'Sundays 2-4am UTC')",
        ],
    },
    {
        "slug": "professional-services-agreement",
        "name": "Professional Services Agreement",
        "description": "Governs the delivery of professional or consulting services, including statements of work, fees, IP ownership, and warranties.",
        "fields": [
            "providerName: Provider's company name",
            "customerName: Customer's company name",
            "effectiveDate: agreement start date in YYYY-MM-DD format",
            "governingLaw: US state name",
            "chosenCourts: courts for disputes",
            "deliverables: description of work and deliverables to be provided",
            "fees: payment amount and structure",
            "paymentPeriod: when payment is due (e.g. 'Net 30 from invoice')",
            "sowTerm: statement of work duration",
            "generalCapAmount: liability cap amount",
        ],
    },
    {
        "slug": "data-processing-agreement",
        "name": "Data Processing Agreement",
        "description": "Establishes rights and obligations of data controllers and processors under GDPR and other privacy regulations.",
        "fields": [
            "providerName: Provider's (data processor) company name",
            "customerName: Customer's (data controller) company name",
            "agreementReference: name or date of the master agreement this DPA supplements",
            "governingMemberState: EU member state for governing law (e.g. 'Ireland')",
            "securityPolicy: URL or description of Provider's security policy",
            "providerSecurityContact: security contact email address",
            "categoriesOfPersonalData: types of personal data processed (e.g. 'name, email, usage data')",
            "categoriesOfDataSubjects: who the data subjects are (e.g. 'Customer employees and end users')",
            "frequencyOfTransfer: how often data is transferred (e.g. 'continuous during the subscription')",
            "natureAndPurpose: nature and purpose of data processing",
            "durationOfProcessing: how long data is processed (e.g. 'duration of the master agreement')",
        ],
    },
    {
        "slug": "software-license-agreement",
        "name": "Software License Agreement",
        "description": "A standard license for software products covering grant of license, restrictions, fees, warranties, and liability.",
        "fields": [
            "providerName: Provider's company name",
            "customerName: Customer's company name",
            "effectiveDate: agreement start date in YYYY-MM-DD format",
            "subscriptionPeriod: license duration (e.g. '12 months')",
            "permittedUses: allowed uses of the software",
            "licenseLimits: user count or other license limits",
            "paymentProcess: how and when payment is made",
            "governingLaw: US state name",
            "chosenCourts: courts for disputes",
            "generalCapAmount: liability cap amount",
        ],
    },
    {
        "slug": "partnership-agreement",
        "name": "Partnership Agreement",
        "description": "Formalizes a business partnership covering referral or reseller arrangements, revenue sharing, and joint go-to-market.",
        "fields": [
            "companyName: Company's name",
            "partnerName: Partner's company name",
            "effectiveDate: agreement start date in YYYY-MM-DD format",
            "endDate: agreement end date in YYYY-MM-DD format, or 'auto-renewing'",
            "obligations: description of each party's obligations (referral, reseller, co-marketing, etc.)",
            "territory: geographic territory for the partnership (e.g. 'North America' or 'Worldwide')",
            "paymentProcess: referral fee or revenue share structure",
            "governingLaw: US state name",
            "chosenCourts: courts for disputes",
            "generalCapAmount: liability cap amount",
        ],
    },
    {
        "slug": "pilot-agreement",
        "name": "Pilot Agreement",
        "description": "A short-term trial agreement allowing a prospective customer to evaluate a product before committing to a full contract.",
        "fields": [
            "providerName: Provider's company name",
            "customerName: Customer's company name",
            "effectiveDate: pilot start date in YYYY-MM-DD format",
            "pilotPeriod: duration of the pilot (e.g. '30 days' or '3 months')",
            "fees: pilot fees if any, or 'No fees'",
            "governingLaw: US state name",
            "chosenCourts: courts for disputes",
            "generalCapAmount: liability cap (e.g. '$10,000')",
            "noticeAddress: notice email or postal address",
        ],
    },
    {
        "slug": "business-associate-agreement",
        "name": "Business Associate Agreement",
        "description": "Required under HIPAA, governs how a business associate may use and safeguard protected health information (PHI).",
        "fields": [
            "providerName: Provider's (business associate) company name",
            "companyName: Covered entity's company name",
            "agreementReference: name or date of the master agreement this BAA supplements",
            "baaEffectiveDate: BAA effective date in YYYY-MM-DD format",
            "breachNotificationPeriod: how quickly PHI breaches must be reported (e.g. '72 hours')",
            "limitations: any restrictions on PHI offshoring, de-identification, or aggregation (or 'None')",
        ],
    },
    {
        "slug": "ai-addendum",
        "name": "AI Addendum",
        "description": "An addendum addressing AI tool use, data ownership, output ownership, compliance, and risk allocation.",
        "fields": [
            "providerName: Provider's company name",
            "customerName: Customer's company name",
            "agreementReference: name or date of the master agreement this Addendum supplements",
            "trainingData: what customer data, if any, may be used for AI model training (or 'None')",
            "trainingPurposes: purposes for which data may be used in training",
            "trainingRestrictions: restrictions on AI training use of customer data",
            "improvementRestrictions: restrictions on non-training AI improvement use",
        ],
    },
]


def get_doc_by_slug(slug: str) -> Optional[dict]:
    return next((d for d in CATALOG if d["slug"] == slug), None)


def catalog_summary() -> str:
    lines = []
    for doc in CATALOG:
        lines.append(f'- "{doc["slug"]}": {doc["name"]} — {doc["description"]}')
    return "\n".join(lines)

// TODO: client to review practice area copy.
// Plain-language summaries of each area as practised in South Africa. Conservative by design:
// no outcomes, no superlatives, no claims beyond what the area covers.

export interface PracticeArea {
  slug: string;
  name: string;
  summary: string;
  typicalMatters: string[];
}

export interface PracticeGroup {
  slug: string;
  name: string;
  areas: PracticeArea[];
}

export const practiceGroups: PracticeGroup[] = [
  {
    slug: "business-technology",
    name: "Business & Technology",
    areas: [
      {
        slug: "corporate-law",
        name: "Corporate Law",
        summary:
          "Forming, running and restructuring companies under the Companies Act, from the founding documents to the agreements between the people who own and manage the business.",
        typicalMatters: [
          "Registering a company and drafting its Memorandum of Incorporation",
          "Shareholders' agreements and changes in shareholding",
          "Commercial contracts with suppliers, customers and service providers",
          "Directors' duties and board resolutions",
          "Due diligence before buying or investing in a business",
        ],
      },
      {
        slug: "ict-law",
        name: "ICT Law",
        summary:
          "The law that applies to information, data and technology, including the Protection of Personal Information Act (POPIA), the Electronic Communications and Transactions Act and the Cybercrimes Act.",
        typicalMatters: [
          "POPIA compliance, privacy notices and Information Officer duties",
          "Responding to a data breach or security compromise",
          "Software development, licensing and cloud service agreements",
          "Website terms, online sales and electronic signatures",
          "IT outsourcing and service level agreements",
        ],
      },
      {
        slug: "tax-law",
        name: "Tax Law",
        summary:
          "Advice on the legal side of tax obligations to the South African Revenue Service (SARS), including how a transaction or structure is taxed and how to respond when SARS raises an assessment.",
        typicalMatters: [
          "Objections and appeals against SARS assessments",
          "Tax implications of business structures and transactions",
          "Responding to SARS audits and requests for information",
          "Voluntary disclosure applications",
        ],
      },
    ],
  },
  {
    slug: "disputes",
    name: "Disputes",
    areas: [
      {
        slug: "civil-litigation",
        name: "Civil Litigation",
        summary:
          "Resolving disputes between people or businesses through negotiation, demand letters and, where needed, proceedings in the Magistrates' Courts and the High Court.",
        typicalMatters: [
          "Recovering money owed under a contract or invoice",
          "Defending a summons or claim brought against you",
          "Breach of contract disputes",
          "Urgent applications and interdicts",
          "Enforcing judgments",
        ],
      },
      {
        slug: "labour-law",
        name: "Labour Law",
        summary:
          "The relationship between employers and employees under the Labour Relations Act and the Basic Conditions of Employment Act, including disputes before the CCMA and the Labour Court.",
        typicalMatters: [
          "Unfair dismissal and unfair labour practice disputes",
          "Representation at the CCMA and bargaining councils",
          "Disciplinary hearings and workplace investigations",
          "Employment contracts and workplace policies",
          "Retrenchments and restructuring",
        ],
      },
    ],
  },
  {
    slug: "personal-family",
    name: "Personal & Family",
    areas: [
      {
        slug: "family-law",
        name: "Family Law",
        summary:
          "Legal matters within families, including divorce, the care of children and maintenance, handled under the Divorce Act, the Children's Act and the Maintenance Act.",
        typicalMatters: [
          "Divorce, including settlement agreements",
          "Care of and contact with children (parenting plans)",
          "Child and spousal maintenance",
          "Antenuptial contracts",
          "Domestic violence protection orders",
        ],
      },
      {
        slug: "property-law",
        name: "Property Law",
        summary:
          "Rights and obligations in immovable property, from agreements to buy, sell or lease property to disputes between owners, tenants and neighbours.",
        typicalMatters: [
          "Reviewing or drafting agreements of sale",
          "Residential and commercial lease agreements",
          "Evictions under the PIE Act, for landlords and occupiers",
          "Disputes with sectional title bodies corporate and homeowners' associations",
        ],
      },
      {
        slug: "refugee-immigration-law",
        name: "Refugee & Immigration Law",
        summary:
          "Applications and disputes under the Immigration Act and the Refugees Act, for people who want to live, work or seek protection in South Africa.",
        typicalMatters: [
          "Visa and permit applications, including work and spousal visas",
          "Permanent residence applications",
          "Appeals against refused applications",
          "Asylum and refugee status applications and appeals",
          "Matters involving detention or deportation",
        ],
      },
      {
        slug: "medical-law",
        name: "Medical Law",
        summary:
          "Legal questions that arise in healthcare, including patients' rights, consent and claims where treatment may have caused harm.",
        typicalMatters: [
          "Assessing a possible medical negligence claim",
          "Obtaining medical records",
          "Informed consent and patients' rights questions",
          "Disputes with medical schemes",
        ],
      },
    ],
  },
];

export const practiceAreas: PracticeArea[] = practiceGroups.flatMap((g) => g.areas);

// TODO: attorney to review RAF and estates copy before launch.
// Content for the Road Accident Fund guide (/road-accident-fund/). It is assembled into `speciality` in
// src/data/practice-areas.ts; the page and its FAQPage structured data both read from there.
//
// Legal Practice Council: no outcomes, amounts or success rates; no pressure or urgency language; no fee
// offers unless confirmed in src/data/site.ts; no comparisons with other firms or RAF "agents".

import { site } from "./site";

export const rafSeo = {
  description:
    "Road Accident Fund claims in Pretoria: who can claim, what a claim can cover, how the process works and what to bring to your first consultation.",
};

export const whoCanClaim = [
  "Drivers, passengers, pedestrians and cyclists injured in a motor vehicle accident",
  "Dependants of someone killed in a road accident",
  "People injured in an accident involving an unidentified (hit-and-run) vehicle",
];

export const claimCovers = [
  { title: "Medical expenses", body: "Past and future costs of treatment, care and rehabilitation." },
  { title: "Loss of earnings", body: "Income lost because of the injuries, now and in the future." },
  {
    title: "Loss of support",
    body: "For dependants who relied on a person killed in the accident.",
  },
  {
    title: "General damages",
    body: "For pain, suffering and loss of amenities where the injuries are serious.",
  },
  { title: "Funeral costs", body: "Reasonable funeral expenses after a fatal accident." },
];

export const rafSteps = [
  {
    title: "Consultation and assessment",
    body: "You tell us what happened. We assess whether there is a claim, who may claim and what it may cover.",
  },
  {
    title: "Gathering evidence",
    body: "We collect the accident report, medical records and, where needed, reports from medical and other experts.",
  },
  {
    title: "Lodging and negotiating",
    body: "We lodge the claim with the Road Accident Fund and deal with the Fund on your behalf.",
  },
  {
    title: "Settlement or court",
    body: "If the Fund makes a fair offer, the claim settles. If it does not, the claim can proceed to court.",
  },
];

export const whatToBring = [
  "Your ID",
  "The police case number or accident report",
  "Hospital and medical records",
  "Proof of earnings",
  "Any correspondence from the Road Accident Fund",
];

/**
 * Time limits under the RAF Act. TODO: attorney to verify against the current Act and regulations, then
 * set `verified: true`. Until then the page shows `fallback` instead of any numbers.
 */
export const timeLimits = {
  verified: false as boolean,
  items: [
    "Generally 3 years from the date of the accident to lodge a claim where the owner or driver of the vehicle is identified.",
    "2 years from the date of the accident for claims involving an unidentified (hit-and-run) vehicle.",
    "Summons must generally be served within 5 years of the date of the accident.",
  ],
  fallback:
    "RAF claims have strict legal time limits. Contact us as soon as possible after an accident so we can confirm the deadline that applies to you.",
};

/** Fee answer: neutral by default; fee offers appear only when confirmed in site.ts. */
function feeAnswer(): string {
  const parts = [
    "We discuss fees with you at your first consultation, before any work on your claim begins.",
  ];
  if (site.freeConsultation) parts.push("The first consultation is free.");
  if (site.offersContingency)
    parts.push(
      "Where fees depend on the outcome of the claim, they are governed by the Contingency Fees Act.",
    );
  return parts.join(" ");
}

export const whyTheFirm = [
  {
    title: "Road Accident Fund claims are the core of our practice.",
    body: "This is the work we do every day, so we know the Fund's requirements, forms and procedures and how a claim moves through them.",
  },
  {
    title: "A background in risk management.",
    body: "Meshack Makhafola brings over 25 years of senior experience in risk management and information technology. Claims are assessed methodically and evidence is gathered with care.",
  },
  {
    title: "A structured, documented process.",
    body: "Every claim follows clear steps with written records, and you receive regular updates in plain language about where it stands.",
  },
];

export const rafFaq = [
  {
    question: "Do I need a lawyer to claim from the RAF?",
    answer:
      "No. You can lodge a claim with the Road Accident Fund yourself. An attorney can gather the evidence, work out what the claim should include, deal with the Fund for you and take the claim to court if it does not settle.",
  },
  {
    question: "How long does a claim take?",
    answer:
      "It depends on the injuries, how long treatment and expert reports take, and whether the Fund settles or the claim goes to court. Claims often take more than a year, and some take several years. We explain the stages for your claim at the first consultation.",
  },
  {
    question: "Can I claim if the other driver was not found?",
    answer:
      "Yes. Claims involving an unidentified (hit-and-run) vehicle can be lodged with the Road Accident Fund, but different rules and time limits apply. The accident should be reported to the police.",
  },
  {
    question: "Can I claim if a family member died in an accident?",
    answer:
      "Yes. People who depended on the person who died for financial support, such as a spouse or children, may claim for loss of support. Reasonable funeral costs can also be claimed.",
  },
  {
    question: "What if the RAF rejects or underpays my claim?",
    answer:
      "If the Fund rejects a claim, or makes an offer that does not fairly cover the losses, the claim can be taken further, including by issuing summons and asking a court to decide. Time limits apply to this step too, so it should be discussed with an attorney promptly.",
  },
  {
    question: "What does it cost?",
    answer: feeAnswer(),
  },
];

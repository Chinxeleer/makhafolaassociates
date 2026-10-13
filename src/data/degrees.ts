// Director's degrees, in timeline order. No years unless supplied by the firm.

export interface Degree {
  title: string;
  institution: string;
}

export const degrees: Degree[] = [
  {
    title: "BSc in Mathematics, Physics & Computer Science",
    institution: "University of Limpopo",
  },
  { title: "BSc (Hons) in Physics", institution: "University of South Africa" },
  {
    title: "BCom in Risk Management & Insurance",
    institution: "University of South Africa",
  },
  {
    title: "Postgraduate Diploma in Risk Management",
    institution: "University of South Africa",
  },
  { title: "LLB", institution: "University of Pretoria" },
];

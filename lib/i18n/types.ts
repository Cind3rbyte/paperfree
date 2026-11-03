export type ComparisonKind = "yes" | "no" | "partial" | "soon";

export interface ComparisonCell {
  kind: ComparisonKind;
  text: string;
}

export interface ComparisonRow {
  feature: string;
  paperfree: ComparisonCell;
  acrobat: ComparisonCell;
  ilovepdf: ComparisonCell;
}

export interface TextBlock {
  title: string;
  text: string;
}

export interface ToolTexts {
  title: string;
  navLabel: string;
  tagline: string;
  description: string;
  metaDescription: string;
  highlights: string[];
  tips: TextBlock[];
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export const cell = {
  yes: (text: string): ComparisonCell => ({ kind: "yes", text }),
  no: (text: string): ComparisonCell => ({ kind: "no", text }),
  partial: (text: string): ComparisonCell => ({ kind: "partial", text }),
  soon: (text: string): ComparisonCell => ({ kind: "soon", text }),
};

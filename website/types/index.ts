// ─── Section types for Page.sections JSON ───────────────────────────────────

export interface Section {
  id: string;
  type: SectionType;
  order: number;
  content: Record<string, unknown>;
}

export type SectionType =
  | "hero"
  | "trustStrip"
  | "featuresGrid"
  | "aboutPreview"
  | "sermonsPreview"
  | "eventsPreview"
  | "testimonials"
  | "ctaBand"
  | "textContent"
  | "imageBlock"
  | "faq"
  | "steps"
  | "contactForm"
  | "contactInfo"
  | "grid"
  | "splitContent"
  | "pageHero"
  | "missionVision";

// ─── Form state ──────────────────────────────────────────────────────────────

export type ActionState<T = unknown> = {
  status: "idle" | "success" | "error";
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

// ─── Media ───────────────────────────────────────────────────────────────────

export type MediaType = "image" | "document" | "audio";

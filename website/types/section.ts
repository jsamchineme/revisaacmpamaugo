// Section types for the page editor
// Based on PRD section 4: Section Types (Page.sections JSON)

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

export interface BaseSection {
  id: string;
  type: SectionType;
  order: number;
  content: Record<string, any>;
}

// ─── Section content interfaces ─────────────────────────────────────────────

export interface HeroContent {
  headline: string;
  subheadline: string;
  backgroundImage: string;
  overlay: string; // rgba color
  buttons: { label: string; link: string; variant: "gold" | "ghost" }[];
}

export interface TrustStripContent {
  stats: { number: string; label: string }[];
}

export interface FeaturesGridContent {
  title: string;
  subtitle: string;
  features: { icon: string; title: string; description: string }[];
}

export interface AboutPreviewContent {
  headline: string;
  body: string;
  imageUrl: string;
  ctaLabel: string;
  ctaLink: string;
}

export interface SermonsPreviewContent {
  title: string;
  subtitle: string;
  count: number;
}

export interface EventsPreviewContent {
  title: string;
  subtitle: string;
  count: number;
}

export interface TestimonialsContent {
  testimonialIds: string[];
}

export interface CtaBandContent {
  headline: string;
  description: string;
  buttonLabel: string;
  buttonLink: string;
  bgColor: string;
}

export interface TextContent {
  body: string; // TipTap JSON string
}

export interface ImageBlockContent {
  imageUrl: string;
  caption: string;
  alignment: "left" | "center" | "right";
}

export interface FaqContent {
  items: { question: string; answer: string }[];
}

export interface StepsContent {
  title: string;
  subtitle: string;
  steps: { title: string; description: string }[];
}

export interface ContactFormContent {}

export interface ContactInfoContent {}

export interface GridContent {
  items: { icon: string; title: string; description: string }[];
}

export interface SplitContentContent {
  imageUrl: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaLink: string;
}

export interface PageHeroContent {
  headline: string;
  subtitle: string;
  eyebrow: string;
}

export interface MissionVisionContent {
  missionTitle: string;
  missionBody: string;
  visionTitle: string;
  visionBody: string;
}

// ─── Section type metadata ───────────────────────────────────────────────────

export interface SectionTypeMeta {
  type: SectionType;
  label: string;
  description: string;
  icon: string;
  fields: SectionFieldDef[];
}

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "image"
  | "color"
  | "number"
  | "repeater"
  | "testimonialSelect";

export interface SectionFieldDef {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: any;
  // For repeater fields
  repeaterFields?: SectionFieldDef[];
  repeaterLabel?: string;
  // For select fields
  options?: { value: string; label: string }[];
}

// ─── All section type definitions ────────────────────────────────────────────

export const SECTION_TYPES: SectionTypeMeta[] = [
  {
    type: "hero",
    label: "Hero Section",
    description: "Full-width banner with headline, subheadline, and CTA buttons",
    icon: "Image",
    fields: [
      { key: "headline", label: "Headline", type: "text", placeholder: "Faithful Service. Timeless Truth." },
      { key: "subheadline", label: "Subheadline", type: "textarea", placeholder: "Supporting text..." },
      { key: "backgroundImage", label: "Background Image", type: "image" },
      { key: "overlay", label: "Overlay Color (rgba)", type: "color", defaultValue: "rgba(28,26,23,0.55)" },
      {
        key: "buttons",
        label: "Buttons",
        type: "repeater",
        repeaterLabel: "Button",
        repeaterFields: [
          { key: "label", label: "Label", type: "text", placeholder: "Get in Touch" },
          { key: "link", label: "Link", type: "text", placeholder: "/contact" },
          {
            key: "variant",
            label: "Style",
            type: "text",
            options: [
              { value: "gold", label: "Gold" },
              { value: "ghost", label: "Ghost" },
            ],
            defaultValue: "gold",
          },
        ],
      },
    ],
  },
  {
    type: "trustStrip",
    label: "Trust Strip",
    description: "Burgundy band with statistics (number + label pairs)",
    icon: "BarChart",
    fields: [
      {
        key: "stats",
        label: "Statistics",
        type: "repeater",
        repeaterLabel: "Stat",
        repeaterFields: [
          { key: "number", label: "Number", type: "text", placeholder: "40+" },
          { key: "label", label: "Label", type: "text", placeholder: "Years of Ministry" },
        ],
      },
    ],
  },
  {
    type: "featuresGrid",
    label: "Features Grid",
    description: "Grid of feature blocks with icon, title, and description",
    icon: "LayoutGrid",
    fields: [
      { key: "title", label: "Title", type: "text", placeholder: "A Lifetime of Faithfulness" },
      { key: "subtitle", label: "Subtitle", type: "textarea", placeholder: "Optional subtitle..." },
      {
        key: "features",
        label: "Features",
        type: "repeater",
        repeaterLabel: "Feature",
        repeaterFields: [
          { key: "icon", label: "Icon (emoji or name)", type: "text", placeholder: "📖" },
          { key: "title", label: "Title", type: "text", placeholder: "Biblical Preaching" },
          { key: "description", label: "Description", type: "textarea", placeholder: "Description..." },
        ],
      },
    ],
  },
  {
    type: "aboutPreview",
    label: "About Preview",
    description: "Image + text preview with CTA link",
    icon: "FileText",
    fields: [
      { key: "headline", label: "Headline", type: "text", placeholder: "A Life Given to the Gospel" },
      { key: "body", label: "Body Text", type: "richtext" },
      { key: "imageUrl", label: "Image", type: "image" },
      { key: "ctaLabel", label: "CTA Label", type: "text", placeholder: "Read More" },
      { key: "ctaLink", label: "CTA Link", type: "text", placeholder: "/about" },
    ],
  },
  {
    type: "sermonsPreview",
    label: "Sermons Preview",
    description: "Preview of recent sermons with configurable count",
    icon: "Mic",
    fields: [
      { key: "title", label: "Title", type: "text", placeholder: "Recent Sermons & Teachings" },
      { key: "subtitle", label: "Subtitle", type: "textarea", placeholder: "Optional..." },
      { key: "count", label: "Number to Show", type: "number", defaultValue: 3 },
    ],
  },
  {
    type: "eventsPreview",
    label: "Events Preview",
    description: "Preview of upcoming events with configurable count",
    icon: "Calendar",
    fields: [
      { key: "title", label: "Title", type: "text", placeholder: "Outreach & Events" },
      { key: "subtitle", label: "Subtitle", type: "textarea", placeholder: "Optional..." },
      { key: "count", label: "Number to Show", type: "number", defaultValue: 3 },
    ],
  },
  {
    type: "testimonials",
    label: "Testimonials",
    description: "Select testimonials to display",
    icon: "Quote",
    fields: [
      { key: "testimonialIds", label: "Testimonials", type: "testimonialSelect" },
    ],
  },
  {
    type: "ctaBand",
    label: "CTA Band",
    description: "Gradient burgundy call-to-action band with button",
    icon: "Megaphone",
    fields: [
      { key: "headline", label: "Headline", type: "text", placeholder: "However far the road..." },
      { key: "description", label: "Description", type: "textarea", placeholder: "Supporting text..." },
      { key: "buttonLabel", label: "Button Label", type: "text", placeholder: "Get in Touch" },
      { key: "buttonLink", label: "Button Link", type: "text", placeholder: "/contact" },
      { key: "bgColor", label: "Background Color", type: "color", defaultValue: "#5a2231" },
    ],
  },
  {
    type: "textContent",
    label: "Text Content",
    description: "Rich text block (TipTap editor)",
    icon: "AlignLeft",
    fields: [
      { key: "body", label: "Body", type: "richtext" },
    ],
  },
  {
    type: "imageBlock",
    label: "Image Block",
    description: "Single image with caption and alignment",
    icon: "ImageIcon",
    fields: [
      { key: "imageUrl", label: "Image", type: "image" },
      { key: "caption", label: "Caption", type: "text", placeholder: "Image caption..." },
      {
        key: "alignment",
        label: "Alignment",
        type: "text",
        options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
        ],
        defaultValue: "center",
      },
    ],
  },
  {
    type: "faq",
    label: "FAQ",
    description: "Frequently asked questions accordion",
    icon: "HelpCircle",
    fields: [
      {
        key: "items",
        label: "Q&A Items",
        type: "repeater",
        repeaterLabel: "Question",
        repeaterFields: [
          { key: "question", label: "Question", type: "text", placeholder: "How do I...?" },
          { key: "answer", label: "Answer", type: "textarea", placeholder: "Answer..." },
        ],
      },
    ],
  },
  {
    type: "steps",
    label: "Steps",
    description: "Numbered step grid with title and description",
    icon: "ListOrdered",
    fields: [
      { key: "title", label: "Title", type: "text", placeholder: "How to Invite" },
      { key: "subtitle", label: "Subtitle", type: "textarea", placeholder: "Optional..." },
      {
        key: "steps",
        label: "Steps",
        type: "repeater",
        repeaterLabel: "Step",
        repeaterFields: [
          { key: "title", label: "Title", type: "text", placeholder: "Step title" },
          { key: "description", label: "Description", type: "textarea", placeholder: "Step description" },
        ],
      },
    ],
  },
  {
    type: "contactForm",
    label: "Contact Form",
    description: "Renders the contact form (no configuration needed)",
    icon: "Mail",
    fields: [],
  },
  {
    type: "contactInfo",
    label: "Contact Info",
    description: "Renders contact info from Settings (no configuration needed)",
    icon: "Phone",
    fields: [],
  },
  {
    type: "grid",
    label: "Grid",
    description: "3-column responsive grid of icon + title + description items",
    icon: "Grid3x3",
    fields: [
      {
        key: "items",
        label: "Grid Items",
        type: "repeater",
        repeaterLabel: "Item",
        repeaterFields: [
          { key: "icon", label: "Icon (emoji or name)", type: "text", placeholder: "⛪" },
          { key: "title", label: "Title", type: "text", placeholder: "Item title" },
          { key: "description", label: "Description", type: "textarea", placeholder: "Item description" },
        ],
      },
    ],
  },
  {
    type: "splitContent",
    label: "Split Content",
    description: "2-column layout: image + text with CTA",
    icon: "Columns",
    fields: [
      { key: "imageUrl", label: "Image", type: "image" },
      { key: "headline", label: "Headline", type: "text", placeholder: "Section headline" },
      { key: "body", label: "Body", type: "richtext" },
      { key: "ctaLabel", label: "CTA Label", type: "text", placeholder: "Learn More" },
      { key: "ctaLink", label: "CTA Link", type: "text", placeholder: "/about" },
    ],
  },
  {
    type: "pageHero",
    label: "Page Hero",
    description: "Cream background hero with eyebrow, headline, and subtitle",
    icon: "Heading",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text", placeholder: "About Us" },
      { key: "headline", label: "Headline", type: "text", placeholder: "Our Story" },
      { key: "subtitle", label: "Subtitle", type: "textarea", placeholder: "Supporting text..." },
    ],
  },
  {
    type: "missionVision",
    label: "Mission & Vision",
    description: "Two-column mission and vision block",
    icon: "Target",
    fields: [
      { key: "missionTitle", label: "Mission Title", type: "text", placeholder: "Our Mission" },
      { key: "missionBody", label: "Mission Body", type: "richtext" },
      { key: "visionTitle", label: "Vision Title", type: "text", placeholder: "Our Vision" },
      { key: "visionBody", label: "Vision Body", type: "richtext" },
    ],
  },
];

export const SECTION_TYPE_MAP: Record<SectionType, SectionTypeMeta> = SECTION_TYPES.reduce(
  (acc, meta) => {
    acc[meta.type] = meta;
    return acc;
  },
  {} as Record<SectionType, SectionTypeMeta>
);

export function getSectionLabel(type: SectionType): string {
  return SECTION_TYPE_MAP[type]?.label ?? type;
}

export function getSectionDescription(type: SectionType): string {
  return SECTION_TYPE_MAP[type]?.description ?? "";
}

export function createDefaultContent(type: SectionType): Record<string, any> {
  const meta = SECTION_TYPE_MAP[type];
  if (!meta) return {};
  const content: Record<string, any> = {};
  for (const field of meta.fields) {
    if (field.type === "repeater") {
      content[field.key] = [];
    } else if (field.type === "testimonialSelect") {
      content[field.key] = [];
    } else {
      content[field.key] = field.defaultValue ?? "";
    }
  }
  return content;
}

export function generateSectionId(): string {
  return `sec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
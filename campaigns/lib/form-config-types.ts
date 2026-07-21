export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "select"
  | "checkbox"
  | "textarea"
  | "radio"
  | "number"
  | "guestGroup";

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  conditional?: string[];
  /** Maximum value for number inputs (absolute cap). */
  max?: number;
  /** Query param key (e.g. "noi") whose value should override `max` at runtime. */
  maxFromQuery?: string;
  /** For `guestGroup`: id of the number field that controls how many copies to render. */
  countField?: string;
  /** For `guestGroup`: fields to render for each guest. */
  subFields?: FormField[];
}

export interface FormConfig {
  title: string;
  fields: FormField[];
}

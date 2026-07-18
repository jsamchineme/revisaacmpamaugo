import { z } from "zod";

const VALID_TEMPLATE_VARIABLES = ["name", "link"] as const;

export const campaignSchema = z.object({
  title: z.string().min(1, "Title is required"),
  whatsappTemplateSid: z.string().optional().or(z.literal("")),
  whatsappTemplateVariables: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        const vars = val.split(",").map((v) => v.trim()).filter(Boolean);
        return vars.every((v) => VALID_TEMPLATE_VARIABLES.includes(v as typeof VALID_TEMPLATE_VARIABLES[number]));
      },
      {
        message: `Template variables must be comma-separated from: ${VALID_TEMPLATE_VARIABLES.join(", ")}`,
      }
    ),
  emailBody: z.string().optional().or(z.literal("")),
  link: z.string().min(1, "Link is required").url("Link must be a valid URL"),
});

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
});

export const contactUpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
});

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional().or(z.literal("")),
  capacity: z.string().optional().or(z.literal("")),
  imageUrl: z.string().optional().or(z.literal("")),
  designContent: z.string().optional().or(z.literal("")),
  formConfig: z.string().optional().or(z.literal("")),
});

export type EventFormData = z.infer<typeof eventSchema>;

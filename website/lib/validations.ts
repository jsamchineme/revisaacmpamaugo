import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "EDITOR", "AUTHOR"]).default("EDITOR"),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  role: z.enum(["ADMIN", "EDITOR", "AUTHOR"]).default("EDITOR"),
});

export const settingsSchema = z.object({
  siteTitle: z.string().optional(),
  tagline: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  contactLocation: z.string().optional(),
  socialLinks: z.object({
    facebook: z.string().optional(),
    youtube: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
  }).optional(),
});

export const sermonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().optional(),
  category: z.string().optional(),
  scriptureRef: z.string().optional(),
  imageUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  body: z.string().optional(),
  published: z.boolean().default(false),
});

export const teachingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  excerpt: z.string().optional(),
  category: z.string().optional(),
  scriptureRef: z.string().optional(),
  imageUrl: z.string().optional(),
  body: z.string().optional(),
  published: z.boolean().default(false),
});

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  excerpt: z.string().optional(),
  category: z.string().optional(),
  date: z.string().optional(),
  imageUrl: z.string().optional(),
  body: z.string().optional(),
  published: z.boolean().default(false),
});

export const testimonialSchema = z.object({
  quote: z.string().min(1, "Quote is required"),
  author: z.string().min(1, "Author is required"),
  role: z.string().optional(),
  order: z.number().int().default(0),
  published: z.boolean().default(true),
});

export const contactMessageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  message: z.string().min(1, "Message is required"),
});

export const mediaSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  url: z.string().min(1, "URL is required"),
  type: z.enum(["image", "document", "audio"]),
  size: z.number().int().min(0),
});

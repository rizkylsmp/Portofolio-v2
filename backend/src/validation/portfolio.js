import { z } from "zod";

const text = (max = 20000) => z.string().max(max).refine((value) => new TextEncoder().encode(value).length <= 65535, "Teks terlalu besar untuk database.");
const short = (max) => text(max).trim().min(1);
const url = text(2048).refine((value) => {
  if (!value || value === "#" || value === "-") return true;
  if (/^[\u0000-\u0020]|[\u0000-\u001f\\]/.test(value)) return false;
  if (/^\/(?!\/)/.test(value)) return true;
  try { return ["http:", "https:", "mailto:", "tel:"].includes(new URL(value).protocol); }
  catch { return false; }
}, "URL harus HTTP/HTTPS, mailto, tel, atau path lokal.");
const images = z.array(url).max(100);
const metadata = { id: z.union([z.string(), z.number()]).optional(), createdAt: z.number().optional(), updatedAt: z.number().optional(), order: z.number().int().nonnegative().optional() };
const shape = {
  profile: z.object({ name: short(180), position: short(2000), description: text(), photo: url, resumeUrl: url, resumeLabel: text(80), socialMedia: z.array(z.object({ type: short(60), url })).max(30) }).nullable(),
  skills: z.array(z.object({ ...metadata, name: short(120), src: url, alt: text(160), order: z.number().int().nonnegative() })).max(200),
  experiences: z.array(z.object({ ...metadata, company: short(180), companyDescription: text(), position: short(180), period: short(120), location: text(180), description: text(), companyLogo: url, image: url.optional(), images: images.default([]), skills: z.array(text(120)).max(100), responsibilities: z.array(z.object({ icon: text(80), title: text(180), description: text() })).max(100), badge: text(180).optional() })).max(200),
  projects: z.array(z.object({ ...metadata, title: short(180), description: text(), images, techIcons: z.array(text(80)).max(100), link: url, buttonText: text(80), category: z.enum(["website", "game"]), aos: text(80) })).max(500),
  certificates: z.array(z.object({ ...metadata, title: short(180), description: text(), images, count: z.number().int().nonnegative(), color: text(120).optional(), category: text(80).optional(), icon: text(80).optional() })).max(500),
  contact: z.object({ heading: short(220), subheading: text(), links: z.array(z.object({ type: short(60), label: text(120), href: url })).max(50) }).nullable(),
};
export const portfolioSections = Object.keys(shape);
export const portfolioSchema = z.object(shape);
export const portfolioPatchSchema = portfolioSchema.partial().strict();

export function validatePortfolio(value, partial = false) {
  const result = (partial ? portfolioPatchSchema : portfolioSchema).safeParse(value);
  if (!result.success) {
    const message = result.error.issues.map((issue) => `${issue.path.join(".") || "data"}: ${issue.message}`).join("; ");
    throw Object.assign(new Error(message), { status: 400 });
  }
  if (partial && !Object.keys(result.data).length) throw Object.assign(new Error("Perubahan kosong."), { status: 400 });
  return result.data;
}

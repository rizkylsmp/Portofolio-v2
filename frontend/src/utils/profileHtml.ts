import DOMPurify from "dompurify";

export function safeProfileHtml(value: string): string {
  return DOMPurify.sanitize(value, { ALLOWED_TAGS: ["b", "strong", "i", "em", "br", "span"], ALLOWED_ATTR: [] });
}

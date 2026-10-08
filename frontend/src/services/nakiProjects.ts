export const playgroundKindLabels = {
  company: "Project",
  project: "Portofolio",
  design: "Design",
} as const;

export interface PlaygroundProject {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  link: string;
  kind: "company" | "project" | "design";
  niche: string;
  techStack: string[];
}

function stack(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean))] : [];
}

function publicUrl(value: unknown, baseUrl: string | URL, allowUploadPath = false): string {
  if (typeof value !== "string") return "";
  const source = value.trim();
  if (!/^https?:\/\//i.test(source) && !(allowUploadPath && source.startsWith("/uploads/"))) {
    return "";
  }

  try {
    const url = new URL(source, baseUrl);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

export function mapNakiProject(value: unknown, baseUrl: string | URL): PlaygroundProject {
  if (!value || typeof value !== "object") throw new Error("Invalid Naki Code project.");
  const project = value as Record<string, unknown>;
  if (typeof project.id !== "number" || !Number.isSafeInteger(project.id) || project.id <= 0 ||
      typeof project.title !== "string" || !project.title.trim()) {
    throw new Error("Invalid Naki Code project.");
  }

  const sourceImages: unknown[] = Array.isArray(project.imageUrls) && project.imageUrls.length
    ? project.imageUrls
    : [project.imageUrl];
  const coverIndex = typeof project.coverIndex === "number" && Number.isInteger(project.coverIndex) &&
    project.coverIndex >= 0 && project.coverIndex < sourceImages.length ? project.coverIndex : 0;
  const images = [...new Set([
    sourceImages[coverIndex],
    ...sourceImages.filter((_, index) => index !== coverIndex),
  ].map((image) => publicUrl(image, baseUrl, true)).filter(Boolean))];

  return {
    id: `naki-${project.id}`,
    kind: "project",
    niche: "",
    techStack: stack(project.techStack),
    title: project.title.trim(),
    description: typeof project.description === "string" ? project.description : "",
    category: typeof project.category === "string" && project.category.trim()
      ? project.category.trim() : "Website",
    images,
    link: publicUrl(project.websiteUrl, baseUrl),
  };
}

interface FetchNakiProjectsOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
}

export function mapNakiDesign(value: unknown, baseUrl: string | URL): PlaygroundProject {
  const mapped = mapNakiProject(value, baseUrl);
  const design = value as Record<string, unknown>;
  return {
    ...mapped,
    id: `naki-design-${design.id}`,
    kind: "design",
    niche: typeof design.niche === "string" ? design.niche.trim() : "",
    techStack: stack(design.stack),
    images: [...new Set((Array.isArray(design.preview) ? design.preview : []).map((item) =>
      publicUrl(item && typeof item === "object" ? item.image : item, baseUrl, true)
    ).filter(Boolean))],
    link: publicUrl(design.demoUrl, baseUrl),
  };
}

export async function fetchNakiDesigns({
  baseUrl = import.meta.env?.VITE_NAKI_API_URL || "https://naki-api.vercel.app",
  fetchImpl = fetch,
  signal = AbortSignal.timeout(20000),
}: FetchNakiProjectsOptions = {}): Promise<PlaygroundProject[]> {
  const apiBase = new URL(baseUrl);
  if (!["http:", "https:"].includes(apiBase.protocol)) throw new Error("VITE_NAKI_API_URL must use HTTP or HTTPS.");
  const response = await fetchImpl(new URL("/api/designs", apiBase), {
    headers: { Accept: "application/json" }, credentials: "omit", signal,
  });
  if (!response.ok) throw new Error(`Naki Code returned HTTP ${response.status}.`);
  const data = await response.json();
  if (!data || !Array.isArray(data.templates)) throw new Error("Invalid Naki Code design response.");
  return data.templates.filter((item: Record<string, unknown>) => item.publicationStatus !== "draft").map((item: unknown) => mapNakiDesign(item, apiBase));
}

export async function fetchNakiProjects({
  baseUrl = import.meta.env?.VITE_NAKI_API_URL || "https://naki-api.vercel.app",
  fetchImpl = fetch,
  signal = AbortSignal.timeout(20000),
}: FetchNakiProjectsOptions = {}): Promise<PlaygroundProject[]> {
  const apiBase = new URL(baseUrl);
  if (!["http:", "https:"].includes(apiBase.protocol)) {
    throw new Error("VITE_NAKI_API_URL must use HTTP or HTTPS.");
  }
  const endpoint = new URL("/api/projects", apiBase);
  const projects = new Map<string, PlaygroundProject>();
  let totalPages = 1;

  // The unpaginated endpoint is capped at 30 projects, so always follow pagination.
  for (let page = 1; page <= totalPages; page += 1) {
    endpoint.searchParams.set("page", String(page));
    endpoint.searchParams.set("pageSize", "30");
    const response = await fetchImpl(endpoint, {
      headers: { Accept: "application/json" },
      credentials: "omit",
      signal,
    });
    if (!response.ok) throw new Error(`Naki Code returned HTTP ${response.status}.`);

    const value: unknown = await response.json();
    if (!value || typeof value !== "object") throw new Error("Invalid Naki Code pagination response.");
    const data = value as Record<string, unknown>;
    if (!Array.isArray(data.projects) || data.page !== page ||
        typeof data.totalPages !== "number" || !Number.isSafeInteger(data.totalPages) || data.totalPages < 1) {
      throw new Error("Invalid Naki Code pagination response.");
    }

    totalPages = data.totalPages;
    for (const item of data.projects) {
      const project = mapNakiProject(item, apiBase);
      projects.set(project.id, project);
    }
  }

  return [...projects.values()];
}

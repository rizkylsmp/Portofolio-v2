import { config } from "../config/env.js";

function publicUrl(value, baseUrl, allowUploadPath = false) {
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

export function mapNakiProject(project, baseUrl) {
  if (!project || !Number.isSafeInteger(project.id) || project.id <= 0 ||
      typeof project.title !== "string" || !project.title.trim()) {
    throw new Error("Invalid Naki Code project.");
  }

  const sourceImages = Array.isArray(project.imageUrls) && project.imageUrls.length
    ? project.imageUrls
    : [project.imageUrl];
  const coverIndex = Number.isInteger(project.coverIndex) && project.coverIndex >= 0 &&
    project.coverIndex < sourceImages.length ? project.coverIndex : 0;
  const images = [...new Set([
    sourceImages[coverIndex],
    ...sourceImages.filter((_, index) => index !== coverIndex),
  ].map((image) => publicUrl(image, baseUrl, true)).filter(Boolean))];

  return {
    id: `naki-${project.id}`,
    title: project.title.trim(),
    description: typeof project.description === "string" ? project.description : "",
    category: typeof project.category === "string" && project.category.trim()
      ? project.category.trim() : "Website",
    images,
    link: publicUrl(project.websiteUrl, baseUrl),
  };
}

export async function fetchNakiProjects({
  baseUrl = config.nakiApiUrl,
  fetchImpl = fetch,
  signal = AbortSignal.timeout(15000),
} = {}) {
  const apiBase = new URL(baseUrl);
  if (!["http:", "https:"].includes(apiBase.protocol)) {
    throw new Error("NAKI_API_URL must use HTTP or HTTPS.");
  }
  const endpoint = new URL("/api/projects", apiBase);
  const projects = new Map();
  let totalPages = 1;

  // The unpaginated endpoint is capped at 30 projects, so always follow pagination.
  for (let page = 1; page <= totalPages; page += 1) {
    endpoint.searchParams.set("page", String(page));
    endpoint.searchParams.set("pageSize", "30");
    const response = await fetchImpl(endpoint, {
      headers: { Accept: "application/json" },
      signal,
    });
    if (!response.ok) throw new Error(`Naki Code returned HTTP ${response.status}.`);

    const data = await response.json();
    if (!data || !Array.isArray(data.projects) || data.page !== page ||
        !Number.isSafeInteger(data.totalPages) || data.totalPages < 1) {
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

let pendingRequest;

export function readPlaygroundProjects() {
  // Share concurrent reads without retaining an outdated copy of the portfolio.
  pendingRequest ??= fetchNakiProjects().finally(() => {
    pendingRequest = undefined;
  });
  return pendingRequest;
}

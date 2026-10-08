import assert from "node:assert/strict";
import test from "node:test";
import { fetchNakiProjects, mapNakiProject, fetchNakiDesigns, mapNakiDesign } from "./nakiProjects.ts";

const baseUrl = "https://naki.example.test";
const project = (id, overrides = {}) => ({
  id,
  title: `Project ${id}`,
  category: "Dashboard",
  description: "Project description",
  websiteUrl: "https://project.example.test/",
  imageUrls: ["/uploads/first.png", "/uploads/cover.png", "/uploads/third.png"],
  coverIndex: 1,
  ...overrides,
});
const page = (number, projects, totalPages = 1) => Response.json({
  page: number,
  totalPages,
  projects,
});

test("maps source category, cover, gallery and public website", () => {
  assert.deepEqual(mapNakiProject(project(8), baseUrl), {
    id: "naki-8",
    kind: "project",
    niche: "",
    techStack: [],
    title: "Project 8",
    category: "Dashboard",
    description: "Project description",
    link: "https://project.example.test/",
    images: [
      `${baseUrl}/uploads/cover.png`,
      `${baseUrl}/uploads/first.png`,
      `${baseUrl}/uploads/third.png`,
    ],
  });
});

test("normalizes project tech stack without duplicating values", () => {
  assert.deepEqual(mapNakiProject(project(1, { techStack: ["React", " React ", "", 5, "Tailwind"] }), baseUrl).techStack, ["React", "Tailwind"]);
});

test("maps design categories, niche, stack and preview gallery separately from projects", () => {
  const design = mapNakiDesign({ id: 1, title: "Restaurant", category: "Landing Page", niche: "Food", stack: ["Next.js"], preview: [{ image: "/uploads/cover.png" }, { image: "javascript:alert(1)" }], demoUrl: "https://demo.example.test" }, baseUrl);
  assert.equal(design.id, "naki-design-1");
  assert.equal(design.kind, "design");
  assert.equal(design.category, "Landing Page");
  assert.equal(design.niche, "Food");
  assert.deepEqual(design.techStack, ["Next.js"]);
  assert.deepEqual(design.images, [`${baseUrl}/uploads/cover.png`]);
  assert.equal(design.link, "https://demo.example.test/");
});

test("fetches public designs, excludes drafts and validates responses", async () => {
  const result = await fetchNakiDesigns({ baseUrl, fetchImpl: async (url, options) => {
    assert.equal(url.pathname, "/api/designs");
    assert.equal(options.credentials, "omit");
    return Response.json({ templates: [{ id: 1, title: "Visible", publicationStatus: "published" }, { id: 2, title: "Draft", publicationStatus: "draft" }] });
  } });
  assert.equal(result.length, 1);
  await assert.rejects(fetchNakiDesigns({ baseUrl, fetchImpl: async () => Response.json({}) }), /design response/);
  await assert.rejects(fetchNakiDesigns({ baseUrl, fetchImpl: async () => new Response(null, { status: 503 }) }), /HTTP 503/);
});

test("keeps legacy images and normalizes invalid cover indexes", () => {
  const legacy = mapNakiProject(project(1, {
    imageUrls: [], imageUrl: "/uploads/old.png", coverIndex: 9,
  }), baseUrl);
  assert.deepEqual(legacy.images, [`${baseUrl}/uploads/old.png`]);
});

test("does not expose placeholder or executable URLs", () => {
  const result = mapNakiProject(project(1, {
    websiteUrl: "javascript:alert(1)",
    imageUrls: ["javascript:alert(1)", "/uploads/image.png", "/uploads/image.png"],
    coverIndex: 0,
  }), baseUrl);
  assert.equal(result.link, "");
  assert.deepEqual(result.images, [`${baseUrl}/uploads/image.png`]);
  assert.equal(mapNakiProject(project(1, { websiteUrl: "#" }), baseUrl).link, "");
});

test("reads every page beyond the upstream limit and preserves newest-first order", async () => {
  const requests = [];
  const result = await fetchNakiProjects({
    baseUrl,
    fetchImpl: async (url) => {
      requests.push(url.href);
      return url.searchParams.get("page") === "1"
        ? page(1, Array.from({ length: 30 }, (_, index) => project(31 - index)), 2)
        : page(2, [project(1)], 2);
    },
  });
  assert.equal(result.length, 31);
  assert.equal(result[0].id, "naki-31");
  assert.equal(result[30].id, "naki-1");
  assert.deepEqual(requests, [
    `${baseUrl}/api/projects?page=1&pageSize=30`,
    `${baseUrl}/api/projects?page=2&pageSize=30`,
  ]);
});

test("deduplicates records shifted between pages during an upstream insert", async () => {
  const result = await fetchNakiProjects({
    baseUrl,
    fetchImpl: async (url) => url.searchParams.get("page") === "1"
      ? page(1, [project(3), project(2)], 2)
      : page(2, [project(2), project(1)], 2),
  });
  assert.deepEqual(result.map((item) => item.id), ["naki-3", "naki-2", "naki-1"]);
});

test("returns a genuinely empty feed without replacing it with local projects", async () => {
  assert.deepEqual(await fetchNakiProjects({
    baseUrl, fetchImpl: async () => page(1, []),
  }), []);
});

test("rejects upstream outages rather than treating them as an empty portfolio", async () => {
  await assert.rejects(fetchNakiProjects({
    baseUrl, fetchImpl: async () => new Response("Unavailable", { status: 503 }),
  }), /HTTP 503/);
});

test("rejects malformed pagination and incomplete later pages", async () => {
  await assert.rejects(fetchNakiProjects({
    baseUrl, fetchImpl: async () => Response.json({ projects: [] }),
  }), /pagination/);
  await assert.rejects(fetchNakiProjects({
    baseUrl,
    fetchImpl: async (url) => url.searchParams.get("page") === "1"
      ? page(1, [project(2)], 2)
      : new Response("Unavailable", { status: 503 }),
  }), /HTTP 503/);
});

test("passes one abort signal through all upstream requests", async () => {
  const signal = AbortSignal.abort();
  await assert.rejects(fetchNakiProjects({
    baseUrl,
    signal,
    fetchImpl: async (_url, options) => {
      assert.equal(options.signal, signal);
      options.signal.throwIfAborted();
    },
  }), { name: "AbortError" });
});

test("reads the public API directly without cookies or authorization headers", async () => {
  const result = await fetchNakiProjects({
    baseUrl,
    fetchImpl: async (url, options) => {
      assert.equal(url.origin, baseUrl);
      assert.equal(url.pathname, "/api/projects");
      assert.equal(options.credentials, "omit");
      assert.deepEqual(options.headers, { Accept: "application/json" });
      return page(1, [project(1)]);
    },
  });
  assert.equal(result.length, 1);
});

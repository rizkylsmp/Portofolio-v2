// ==========================================
// Portfolio Data Service
// ==========================================
// DB-only mode: GET /api/portfolio and versioned PATCH /api/admin/portfolio
// ==========================================

import type { Experience, Project, Certificate, Profile, Skill, ContactConfig } from "../types/content";
import { AxiosError } from "axios";
import { apiClient, getApiErrorMessage, getApiErrorData } from "./apiClient";
import { getSessionToken, logout } from "./authService";
import { validatePortfolio } from "../validation/portfolio.js";

interface PortfolioStore {
  profile: Profile | null;
  skills: Skill[];
  experiences: Experience[];
  projects: Project[];
  certificates: Certificate[];
  contact: ContactConfig | null;
}

type PortfolioSection = keyof PortfolioStore;

type PortfolioData = Partial<{
  profile: Profile | null;
  skills: Skill[];
  experiences: Experience[];
  projects: Project[];
  certificates: Certificate[];
  contact: ContactConfig | null;
}>;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function normalizeStore(rawData: PortfolioData): PortfolioStore {
  const data = rawData as Record<string, unknown>;

  const experiences: Experience[] = ((data.experiences as Partial<Experience>[]) || []).map(
    (e, idx) => {
      const images = Array.isArray(e.images)
        ? e.images.filter(Boolean)
        : e.image
          ? [e.image]
          : [];

      return {
        ...e,
        image: e.image || images[0] || "",
        images,
        id: e.id || generateId(),
        order: typeof e.order === "number" ? e.order : idx,
        createdAt: e.createdAt || Date.now() - idx * 1000,
        updatedAt: e.updatedAt || Date.now() - idx * 1000,
      } as Experience;
    }
  );

  const projects: Project[] = ((data.projects as Partial<Project>[]) || []).map(
    (p, idx) => ({
      ...p,
      id: p.id || generateId(),
      order: typeof p.order === "number" ? p.order : idx,
      createdAt: p.createdAt || Date.now() - idx * 1000,
      updatedAt: p.updatedAt || Date.now() - idx * 1000,
    } as Project)
  );

  const certificates: Certificate[] = ((data.certificates as Partial<Certificate>[]) || []).map(
    (c, idx) => {
      const images = Array.isArray(c.images) ? c.images.filter(Boolean) : [];
      return {
        id: c.id || generateId(),
        title: c.title || "",
        description: c.description || "",
        images,
        count: typeof c.count === "number" ? c.count : images.length,
        createdAt: c.createdAt || Date.now() - idx * 1000,
        updatedAt: c.updatedAt || Date.now() - idx * 1000,
      } as Certificate;
    }
  );

  const skills: Skill[] = ((data.skills as Partial<Skill>[]) || []).map((s) => ({
    ...s,
    id: s.id || generateId(),
  } as Skill));

  return {
    profile: (data.profile as Profile) || null,
    skills,
    experiences,
    projects,
    certificates,
    contact: (data.contact as ContactConfig) || null,
  };
}

const store: PortfolioStore = normalizeStore({});
let committed = structuredClone(store);
let versions: Partial<Record<PortfolioSection, string>> = {};

function replaceStore(nextStore: PortfolioStore): void {
  store.profile = nextStore.profile;
  store.skills = nextStore.skills;
  store.experiences = nextStore.experiences;
  store.projects = nextStore.projects;
  store.certificates = nextStore.certificates;
  store.contact = nextStore.contact;
  committed = structuredClone(store);
}

function toPersistableData(): PortfolioData {
  const stripMeta = <T extends { id?: string; createdAt?: number; updatedAt?: number }>(
    items: T[]
  ) => items.map((item) => {
    const clean = { ...item };
    delete clean.id;
    delete clean.createdAt;
    delete clean.updatedAt;
    return clean;
  });

  return {
    profile: store.profile,
    skills: store.skills.map((skill) => ({
      name: skill.name,
      src: skill.src,
      alt: skill.alt,
      order: skill.order,
    } as Skill)),
    experiences: stripMeta(store.experiences) as Experience[],
    projects: stripMeta(store.projects) as Project[],
    certificates: stripMeta(store.certificates) as Certificate[],
    contact: store.contact,
  };
}

export async function initializePortfolioData(): Promise<void> {
  const { data } = await apiClient.get<PortfolioData & { _versions?: typeof versions }>("/api/portfolio");
  replaceStore(normalizeStore(data));
  versions = data._versions || {};
}

async function persistToServer(sections: ReadonlySet<PortfolioSection>, replaceConfirmed = false): Promise<void> {
  const data = toPersistableData();
  const patch = Object.fromEntries(
    [...sections].map((section) => [section, data[section]])
  ) as PortfolioData;
  validatePortfolio(patch, true);
  const token = getSessionToken();
  if (!token) {
    throw new Error("Sesi admin tidak ditemukan. Silakan login ulang.");
  }

  try {
    const { data: response } = await apiClient.patch("/api/admin/portfolio", { ...patch, _versions: versions, _replaceConfirmed: replaceConfirmed }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    for (const section of sections) versions[section] = response._versions?.[section];
  } catch (err) {
    if (err instanceof AxiosError && err.response?.status === 401) {
      logout();
      throw new Error("Sesi admin sudah tidak valid. Silakan login ulang sebelum menyimpan. Data form belum disimpan.");
    }
    const details = getApiErrorData(err).details;
    const message = getApiErrorMessage(err, "Gagal menyimpan data ke backend.");
    throw new Error(typeof details === "string" ? `${message} ${details}` : message);
  }
}

let writeQueue: Promise<unknown> = Promise.resolve();
function mutate<T>(sections: PortfolioSection[], operation: () => T, replaceConfirmed = false): Promise<T> {
  const result = writeQueue.then(async () => {
    const previous = structuredClone(committed);
    try {
      const value = operation();
      await persistToServer(new Set(sections), replaceConfirmed);
      committed = structuredClone(store);
      return value;
    } catch (error) {
      replaceStore(previous);
      throw error;
    }
  });
  writeQueue = result.catch(() => undefined);
  return result;
}

// ---- Profile (singleton) ----

export function getProfile(): Profile | null {
  return committed.profile;
}

export function saveProfile(profile: Profile): Promise<void> {
  return mutate(["profile"], () => { store.profile = profile; });
}

// ---- Skills ----

export function getSkills(): Skill[] {
  return [...committed.skills].sort((a, b) => a.order - b.order);
}

export function getSkill(id: string): Skill | undefined {
  return committed.skills.find((s) => s.id === id);
}

export async function addSkill(data: Omit<Skill, "id">): Promise<Skill> {
  const newItem: Skill = { ...data, id: generateId() };
  return mutate(["skills"], () => { store.skills.push(newItem); return newItem; });
}

export async function updateSkill(id: string, data: Partial<Omit<Skill, "id">>): Promise<Skill | null> {
  return mutate(["skills"], () => {
    const idx = store.skills.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Skill tidak ditemukan. Muat ulang data terbaru.");
    store.skills[idx] = { ...store.skills[idx], ...data };
    return store.skills[idx];
  });
}

export async function deleteSkill(id: string): Promise<boolean> {
  return mutate(["skills"], () => {
    const len = store.skills.length;
    store.skills = store.skills.filter((s) => s.id !== id);
    if (store.skills.length === len) return false;
    return true;
  });
}

export function reorderSkills(skills: Skill[]): Promise<void> {
  return mutate(["skills"], () => { store.skills = skills; });
}

// ---- Contact Config (singleton) ----

export function getContactConfig(): ContactConfig | null {
  return committed.contact;
}

export function saveContactConfig(config: ContactConfig): Promise<void> {
  return mutate(["contact"], () => { store.contact = config; });
}

// ---- Experiences ----

export function getExperiences(): Experience[] {
  return [...committed.experiences].sort((a, b) => {
    const orderDelta = (a.order ?? 0) - (b.order ?? 0);
    return orderDelta || b.createdAt - a.createdAt;
  });
}

export function getExperience(id: string): Experience | undefined {
  return committed.experiences.find((e) => e.id === id);
}

export async function addExperience(
  data: Omit<Experience, "id" | "createdAt" | "updatedAt" | "order"> & Partial<Pick<Experience, "order">>
): Promise<Experience> {
  return mutate(["experiences"], () => {
    const now = Date.now();
    const maxOrder = store.experiences.reduce(
      (max, item) => Math.max(max, item.order ?? -1),
      -1
    );
    const newItem: Experience = {
      ...data,
      order: data.order ?? maxOrder + 1,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    store.experiences.push(newItem);
    return newItem;
  });
}

export async function updateExperience(
  id: string,
  data: Partial<Omit<Experience, "id" | "createdAt">>
): Promise<Experience | null> {
  return mutate(["experiences"], () => {
    const idx = store.experiences.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error("Experience tidak ditemukan. Muat ulang data terbaru.");
    store.experiences[idx] = { ...store.experiences[idx], ...data, updatedAt: Date.now() };
    return store.experiences[idx];
  });
}

export async function deleteExperience(id: string): Promise<boolean> {
  return mutate(["experiences"], () => {
    const len = store.experiences.length;
    store.experiences = store.experiences.filter((e) => e.id !== id);
    if (store.experiences.length === len) return false;
    return true;
  });
}

export function reorderExperiences(experiences: Experience[]): Promise<void> {
  return mutate(["experiences"], () => {
    store.experiences = experiences.map((experience, index) => ({
      ...experience,
      order: index,
      updatedAt: Date.now(),
    }));
  });
}

// ---- Projects ----

export function getProjects(): Project[] {
  return [...committed.projects].sort((a, b) => {
    const orderDelta = (a.order ?? 0) - (b.order ?? 0);
    return orderDelta || b.createdAt - a.createdAt;
  });
}

export function getProjectsByCategory(category: "website" | "game"): Project[] {
  return getProjects().filter((p) => p.category === category);
}

export function getProject(id: string): Project | undefined {
  return committed.projects.find((p) => p.id === id);
}

export async function addProject(
  data: Omit<Project, "id" | "createdAt" | "updatedAt" | "order"> & Partial<Pick<Project, "order">>
): Promise<Project> {
  return mutate(["projects"], () => {
    const now = Date.now();
    const maxOrder = store.projects
      .filter((project) => project.category === data.category)
      .reduce((max, project) => Math.max(max, project.order ?? -1), -1);
    const newItem: Project = {
      ...data,
      order: data.order ?? maxOrder + 1,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    store.projects.push(newItem);
    return newItem;
  });
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, "id" | "createdAt">>
): Promise<Project | null> {
  return mutate(["projects"], () => {
    const idx = store.projects.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Project tidak ditemukan. Muat ulang data terbaru.");
    const currentProject = store.projects[idx];
    const nextCategory = data.category ?? currentProject.category;
    const categoryChanged = nextCategory !== currentProject.category;
    const nextOrder = categoryChanged
      ? store.projects
          .filter((project) => project.category === nextCategory)
          .reduce((max, project) => Math.max(max, project.order ?? -1), -1) + 1
      : data.order ?? currentProject.order;

    store.projects[idx] = {
      ...currentProject,
      ...data,
      order: nextOrder,
      updatedAt: Date.now(),
    };
    return store.projects[idx];
  });
}

export async function deleteProject(id: string): Promise<boolean> {
  return mutate(["projects"], () => {
    const len = store.projects.length;
    store.projects = store.projects.filter((p) => p.id !== id);
    if (store.projects.length === len) return false;
    return true;
  });
}

export function reorderProjects(projects: Project[]): Promise<void> {
  return mutate(["projects"], () => {
    const categoryOrder = { website: 0, game: 0 };
    store.projects = projects.map((project) => ({
      ...project,
      order: categoryOrder[project.category]++,
      updatedAt: Date.now(),
    }));
  });
}

// ---- Certificates ----

export function getCertificates(): Certificate[] {
  return [...committed.certificates].sort((a, b) => b.createdAt - a.createdAt);
}

export function getCertificate(id: string): Certificate | undefined {
  return committed.certificates.find((c) => c.id === id);
}

export async function addCertificate(
  data: Omit<Certificate, "id" | "createdAt" | "updatedAt">
): Promise<Certificate> {
  return mutate(["certificates"], () => {
    const now = Date.now();
    const newItem: Certificate = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    store.certificates.push(newItem);
    return newItem;
  });
}

export async function updateCertificate(
  id: string,
  data: Partial<Omit<Certificate, "id" | "createdAt">>
): Promise<Certificate | null> {
  return mutate(["certificates"], () => {
    const idx = store.certificates.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Certificate tidak ditemukan. Muat ulang data terbaru.");
    store.certificates[idx] = { ...store.certificates[idx], ...data, updatedAt: Date.now() };
    return store.certificates[idx];
  });
}

export async function deleteCertificate(id: string): Promise<boolean> {
  return mutate(["certificates"], () => {
    const len = store.certificates.length;
    store.certificates = store.certificates.filter((c) => c.id !== id);
    if (store.certificates.length === len) return false;
    return true;
  });
}

// ---- Export / Import ----

export function exportAllData(): string {
  return JSON.stringify({
    profile: committed.profile,
    skills: committed.skills,
    contact: committed.contact,
    experiences: committed.experiences,
    projects: committed.projects,
    certificates: committed.certificates,
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

export async function importAllData(jsonString: string): Promise<boolean> {
  let data: unknown;

  try {
    data = JSON.parse(jsonString);
  } catch {
    console.error("Failed to import data");
    return false;
  }

  const validated = validatePortfolio(data) as PortfolioData;
  await mutate(["profile", "skills", "experiences", "projects", "certificates", "contact"], () => {
    Object.assign(store, normalizeStore(validated));
  }, true);
  return true;
}

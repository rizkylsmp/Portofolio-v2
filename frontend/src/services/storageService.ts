// ==========================================
// Portfolio Data Service
// ==========================================
// DB-only mode: GET /api/portfolio and PUT /api/admin/portfolio
// ==========================================

import type { Experience, Project, Certificate, Profile, Skill, ContactConfig } from "../types/content";
import { AxiosError } from "axios";
import { apiClient, getApiErrorMessage } from "./apiClient";
import { getSessionToken, logout } from "./authService";

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

function replaceStore(nextStore: PortfolioStore): void {
  store.profile = nextStore.profile;
  store.skills = nextStore.skills;
  store.experiences = nextStore.experiences;
  store.projects = nextStore.projects;
  store.certificates = nextStore.certificates;
  store.contact = nextStore.contact;
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
  const { data } = await apiClient.get<PortfolioData>("/api/portfolio");
  replaceStore(normalizeStore(data));
}

async function persistToServer(sections: ReadonlySet<PortfolioSection>): Promise<void> {
  const data = toPersistableData();
  const patch = Object.fromEntries(
    [...sections].map((section) => [section, data[section]])
  ) as PortfolioData;
  const token = getSessionToken();
  if (!token) {
    throw new Error("Sesi admin tidak ditemukan. Silakan login ulang.");
  }

  try {
    await apiClient.patch("/api/admin/portfolio", patch, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    if (err instanceof AxiosError && err.response?.status === 401) {
      logout();
    }
    throw new Error(getApiErrorMessage(err, "Gagal menyimpan data ke backend."));
  }
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;
let persistWaiters: Array<{ resolve: () => void; reject: (err: unknown) => void }> = [];
const pendingSections = new Set<PortfolioSection>();

function schedulePersist(section: PortfolioSection): Promise<void> {
  pendingSections.add(section);
  if (persistTimer) clearTimeout(persistTimer);
  const promise = new Promise<void>((resolve, reject) => {
    persistWaiters.push({ resolve, reject });
  });

  persistTimer = setTimeout(async () => {
    const waiters = persistWaiters;
    const sections = new Set(pendingSections);
    persistWaiters = [];
    pendingSections.clear();
    persistTimer = null;
    try {
      await persistToServer(sections);
      waiters.forEach((waiter) => waiter.resolve());
    } catch (err) {
      console.error("[storageService] Failed to persist data:", err);
      waiters.forEach((waiter) => waiter.reject(err));
    }
  }, 500);

  return promise;
}

// ---- Profile (singleton) ----

export function getProfile(): Profile | null {
  return store.profile;
}

export function saveProfile(profile: Profile): Promise<void> {
  store.profile = profile;
  return schedulePersist("profile");
}

// ---- Skills ----

export function getSkills(): Skill[] {
  return [...store.skills].sort((a, b) => a.order - b.order);
}

export function getSkill(id: string): Skill | undefined {
  return store.skills.find((s) => s.id === id);
}

export async function addSkill(data: Omit<Skill, "id">): Promise<Skill> {
  const newItem: Skill = { ...data, id: generateId() };
  store.skills.push(newItem);
  await schedulePersist("skills");
  return newItem;
}

export async function updateSkill(id: string, data: Partial<Omit<Skill, "id">>): Promise<Skill | null> {
  const idx = store.skills.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  store.skills[idx] = { ...store.skills[idx], ...data };
  await schedulePersist("skills");
  return store.skills[idx];
}

export async function deleteSkill(id: string): Promise<boolean> {
  const len = store.skills.length;
  store.skills = store.skills.filter((s) => s.id !== id);
  if (store.skills.length === len) return false;
  await schedulePersist("skills");
  return true;
}

export function reorderSkills(skills: Skill[]): Promise<void> {
  store.skills = skills;
  return schedulePersist("skills");
}

// ---- Contact Config (singleton) ----

export function getContactConfig(): ContactConfig | null {
  return store.contact;
}

export function saveContactConfig(config: ContactConfig): Promise<void> {
  store.contact = config;
  return schedulePersist("contact");
}

// ---- Experiences ----

export function getExperiences(): Experience[] {
  return [...store.experiences].sort((a, b) => {
    const orderDelta = (a.order ?? 0) - (b.order ?? 0);
    return orderDelta || b.createdAt - a.createdAt;
  });
}

export function getExperience(id: string): Experience | undefined {
  return store.experiences.find((e) => e.id === id);
}

export async function addExperience(
  data: Omit<Experience, "id" | "createdAt" | "updatedAt" | "order"> & Partial<Pick<Experience, "order">>
): Promise<Experience> {
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
  await schedulePersist("experiences");
  return newItem;
}

export async function updateExperience(
  id: string,
  data: Partial<Omit<Experience, "id" | "createdAt">>
): Promise<Experience | null> {
  const idx = store.experiences.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  store.experiences[idx] = { ...store.experiences[idx], ...data, updatedAt: Date.now() };
  await schedulePersist("experiences");
  return store.experiences[idx];
}

export async function deleteExperience(id: string): Promise<boolean> {
  const len = store.experiences.length;
  store.experiences = store.experiences.filter((e) => e.id !== id);
  if (store.experiences.length === len) return false;
  await schedulePersist("experiences");
  return true;
}

export function reorderExperiences(experiences: Experience[]): Promise<void> {
  store.experiences = experiences.map((experience, index) => ({
    ...experience,
    order: index,
    updatedAt: Date.now(),
  }));
  return schedulePersist("experiences");
}

// ---- Projects ----

export function getProjects(): Project[] {
  return [...store.projects].sort((a, b) => {
    const orderDelta = (a.order ?? 0) - (b.order ?? 0);
    return orderDelta || b.createdAt - a.createdAt;
  });
}

export function getProjectsByCategory(category: "website" | "game"): Project[] {
  return getProjects().filter((p) => p.category === category);
}

export function getProject(id: string): Project | undefined {
  return store.projects.find((p) => p.id === id);
}

export async function addProject(
  data: Omit<Project, "id" | "createdAt" | "updatedAt" | "order"> & Partial<Pick<Project, "order">>
): Promise<Project> {
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
  await schedulePersist("projects");
  return newItem;
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, "id" | "createdAt">>
): Promise<Project | null> {
  const idx = store.projects.findIndex((p) => p.id === id);
  if (idx === -1) return null;
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
  await schedulePersist("projects");
  return store.projects[idx];
}

export async function deleteProject(id: string): Promise<boolean> {
  const len = store.projects.length;
  store.projects = store.projects.filter((p) => p.id !== id);
  if (store.projects.length === len) return false;
  await schedulePersist("projects");
  return true;
}

export function reorderProjects(projects: Project[]): Promise<void> {
  const categoryOrder = { website: 0, game: 0 };
  store.projects = projects.map((project) => ({
    ...project,
    order: categoryOrder[project.category]++,
    updatedAt: Date.now(),
  }));
  return schedulePersist("projects");
}

// ---- Certificates ----

export function getCertificates(): Certificate[] {
  return [...store.certificates].sort((a, b) => b.createdAt - a.createdAt);
}

export function getCertificate(id: string): Certificate | undefined {
  return store.certificates.find((c) => c.id === id);
}

export async function addCertificate(
  data: Omit<Certificate, "id" | "createdAt" | "updatedAt">
): Promise<Certificate> {
  const now = Date.now();
  const newItem: Certificate = { ...data, id: generateId(), createdAt: now, updatedAt: now };
  store.certificates.push(newItem);
  await schedulePersist("certificates");
  return newItem;
}

export async function updateCertificate(
  id: string,
  data: Partial<Omit<Certificate, "id" | "createdAt">>
): Promise<Certificate | null> {
  const idx = store.certificates.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  store.certificates[idx] = { ...store.certificates[idx], ...data, updatedAt: Date.now() };
  await schedulePersist("certificates");
  return store.certificates[idx];
}

export async function deleteCertificate(id: string): Promise<boolean> {
  const len = store.certificates.length;
  store.certificates = store.certificates.filter((c) => c.id !== id);
  if (store.certificates.length === len) return false;
  await schedulePersist("certificates");
  return true;
}

// ---- Export / Import ----

export function exportAllData(): string {
  return JSON.stringify({
    profile: store.profile,
    skills: store.skills,
    contact: store.contact,
    experiences: store.experiences,
    projects: store.projects,
    certificates: store.certificates,
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

  replaceStore(normalizeStore(data as PortfolioData));
  await Promise.all([
    schedulePersist("profile"),
    schedulePersist("skills"),
    schedulePersist("experiences"),
    schedulePersist("projects"),
    schedulePersist("certificates"),
    schedulePersist("contact"),
  ]);
  return true;
}

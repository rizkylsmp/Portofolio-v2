// ==========================================
// Portfolio Data Service
// ==========================================
// Source of truth: src/data/portfolioData.json
// - In production: data is bundled from JSON at build time (read-only)
// - In development: admin changes are POSTed to Vite dev API
//   which writes back to portfolioData.json (permanent)
// ==========================================

import type { Experience, Project, Certificate, Profile, Skill, ContactConfig } from "../types/content";
import portfolioJson from "../data/portfolioData.json";

// ---- In-memory data store (initialized from JSON) ----

interface PortfolioStore {
  profile: Profile | null;
  skills: Skill[];
  experiences: Experience[];
  projects: Project[];
  certificates: Certificate[];
  contact: ContactConfig | null;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Initialize in-memory store from imported JSON
function initStore(): PortfolioStore {
  const data = portfolioJson as Record<string, unknown>;

  const experiences: Experience[] = ((data.experiences as any[]) || []).map(
    (e: any, idx: number) => ({
      ...e,
      id: e.id || generateId(),
      createdAt: e.createdAt || Date.now() - idx * 1000,
      updatedAt: e.updatedAt || Date.now() - idx * 1000,
    })
  );

  const projects: Project[] = ((data.projects as any[]) || []).map(
    (p: any, idx: number) => ({
      ...p,
      id: p.id || generateId(),
      createdAt: p.createdAt || Date.now() - idx * 1000,
      updatedAt: p.updatedAt || Date.now() - idx * 1000,
    })
  );

  const certificates: Certificate[] = ((data.certificates as any[]) || []).map(
    (c: any, idx: number) => ({
      ...c,
      id: c.id || generateId(),
      createdAt: c.createdAt || Date.now() - idx * 1000,
      updatedAt: c.updatedAt || Date.now() - idx * 1000,
    })
  );

  const skills: Skill[] = ((data.skills as any[]) || []).map((s: any) => ({
    ...s,
    id: s.id || generateId(),
  }));

  return {
    profile: (data.profile as Profile) || null,
    skills,
    experiences,
    projects,
    certificates,
    contact: (data.contact as ContactConfig) || null,
  };
}

const store: PortfolioStore = initStore();

// ---- Persist to JSON file (dev mode only) ----

async function persistToFile(): Promise<void> {
  if (!import.meta.env.DEV) return;

  try {
    const stripMeta = <T extends { id?: string; createdAt?: number; updatedAt?: number }>(
      items: T[]
    ) => items.map(({ id, createdAt, updatedAt, ...rest }) => rest);

    const exportData = {
      profile: store.profile,
      skills: store.skills.map(({ id, ...rest }) => rest),
      experiences: stripMeta(store.experiences),
      projects: stripMeta(store.projects),
      certificates: stripMeta(store.certificates),
      contact: store.contact,
    };

    const res = await fetch("/api/save-portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(exportData, null, 2),
    });

    if (!res.ok) {
      console.error("[storageService] Failed to persist data:", await res.text());
    }
  } catch (err) {
    console.error("[storageService] Failed to persist data:", err);
  }
}

// Debounce persistence to avoid excessive writes
let persistTimer: ReturnType<typeof setTimeout> | null = null;
function schedulePersist(): void {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistToFile();
    persistTimer = null;
  }, 500);
}

// ---- Profile (singleton) ----

export function getProfile(): Profile | null {
  return store.profile;
}

export function saveProfile(profile: Profile): void {
  store.profile = profile;
  schedulePersist();
}

// ---- Skills ----

export function getSkills(): Skill[] {
  return [...store.skills].sort((a, b) => a.order - b.order);
}

export function getSkill(id: string): Skill | undefined {
  return store.skills.find((s) => s.id === id);
}

export function addSkill(data: Omit<Skill, "id">): Skill {
  const newItem: Skill = { ...data, id: generateId() };
  store.skills.push(newItem);
  schedulePersist();
  return newItem;
}

export function updateSkill(id: string, data: Partial<Omit<Skill, "id">>): Skill | null {
  const idx = store.skills.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  store.skills[idx] = { ...store.skills[idx], ...data };
  schedulePersist();
  return store.skills[idx];
}

export function deleteSkill(id: string): boolean {
  const len = store.skills.length;
  store.skills = store.skills.filter((s) => s.id !== id);
  if (store.skills.length === len) return false;
  schedulePersist();
  return true;
}

export function reorderSkills(skills: Skill[]): void {
  store.skills = skills;
  schedulePersist();
}

// ---- Contact Config (singleton) ----

export function getContactConfig(): ContactConfig | null {
  return store.contact;
}

export function saveContactConfig(config: ContactConfig): void {
  store.contact = config;
  schedulePersist();
}

// ---- Experiences ----

export function getExperiences(): Experience[] {
  return [...store.experiences].sort((a, b) => b.createdAt - a.createdAt);
}

export function getExperience(id: string): Experience | undefined {
  return store.experiences.find((e) => e.id === id);
}

export function addExperience(
  data: Omit<Experience, "id" | "createdAt" | "updatedAt">
): Experience {
  const now = Date.now();
  const newItem: Experience = { ...data, id: generateId(), createdAt: now, updatedAt: now };
  store.experiences.push(newItem);
  schedulePersist();
  return newItem;
}

export function updateExperience(
  id: string,
  data: Partial<Omit<Experience, "id" | "createdAt">>
): Experience | null {
  const idx = store.experiences.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  store.experiences[idx] = { ...store.experiences[idx], ...data, updatedAt: Date.now() };
  schedulePersist();
  return store.experiences[idx];
}

export function deleteExperience(id: string): boolean {
  const len = store.experiences.length;
  store.experiences = store.experiences.filter((e) => e.id !== id);
  if (store.experiences.length === len) return false;
  schedulePersist();
  return true;
}

// ---- Projects ----

export function getProjects(): Project[] {
  return [...store.projects].sort((a, b) => b.createdAt - a.createdAt);
}

export function getProjectsByCategory(category: "website" | "game"): Project[] {
  return getProjects().filter((p) => p.category === category);
}

export function getProject(id: string): Project | undefined {
  return store.projects.find((p) => p.id === id);
}

export function addProject(
  data: Omit<Project, "id" | "createdAt" | "updatedAt">
): Project {
  const now = Date.now();
  const newItem: Project = { ...data, id: generateId(), createdAt: now, updatedAt: now };
  store.projects.push(newItem);
  schedulePersist();
  return newItem;
}

export function updateProject(
  id: string,
  data: Partial<Omit<Project, "id" | "createdAt">>
): Project | null {
  const idx = store.projects.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  store.projects[idx] = { ...store.projects[idx], ...data, updatedAt: Date.now() };
  schedulePersist();
  return store.projects[idx];
}

export function deleteProject(id: string): boolean {
  const len = store.projects.length;
  store.projects = store.projects.filter((p) => p.id !== id);
  if (store.projects.length === len) return false;
  schedulePersist();
  return true;
}

// ---- Certificates ----

export function getCertificates(): Certificate[] {
  return [...store.certificates].sort((a, b) => b.createdAt - a.createdAt);
}

export function getCertificate(id: string): Certificate | undefined {
  return store.certificates.find((c) => c.id === id);
}

export function addCertificate(
  data: Omit<Certificate, "id" | "createdAt" | "updatedAt">
): Certificate {
  const now = Date.now();
  const newItem: Certificate = { ...data, id: generateId(), createdAt: now, updatedAt: now };
  store.certificates.push(newItem);
  schedulePersist();
  return newItem;
}

export function updateCertificate(
  id: string,
  data: Partial<Omit<Certificate, "id" | "createdAt">>
): Certificate | null {
  const idx = store.certificates.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  store.certificates[idx] = { ...store.certificates[idx], ...data, updatedAt: Date.now() };
  schedulePersist();
  return store.certificates[idx];
}

export function deleteCertificate(id: string): boolean {
  const len = store.certificates.length;
  store.certificates = store.certificates.filter((c) => c.id !== id);
  if (store.certificates.length === len) return false;
  schedulePersist();
  return true;
}

// ---- Reset (reload from original JSON) ----

export function resetAllData(): void {
  const fresh = initStore();
  store.profile = fresh.profile;
  store.skills = fresh.skills;
  store.experiences = fresh.experiences;
  store.projects = fresh.projects;
  store.certificates = fresh.certificates;
  store.contact = fresh.contact;
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

export function importAllData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.profile) store.profile = data.profile;
    if (data.skills) store.skills = data.skills;
    if (data.contact) store.contact = data.contact;
    if (data.experiences) store.experiences = data.experiences;
    if (data.projects) store.projects = data.projects;
    if (data.certificates) store.certificates = data.certificates;
    schedulePersist();
    return true;
  } catch {
    console.error("Failed to import data");
    return false;
  }
}

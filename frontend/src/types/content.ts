// ==========================================
// Content Types for Portfolio CMS
// ==========================================

export interface SocialMedia {
  type: string; // 'email' | 'whatsapp' | 'linkedin' | 'github' | 'instagram' | 'twitter' | 'youtube' | 'tiktok' | 'website'
  url: string;
}

export interface Profile {
  name: string;
  position: string;
  description: string;
  photo: string;
  socialMedia: SocialMedia[];
  resumeUrl: string;
  resumeLabel: string;
}

export interface Skill {
  id: string;
  name: string;
  src: string; // icon URL
  alt: string;
  order: number;
}

export interface ContactLink {
  type: string; // 'instagram' | 'linkedin' | 'github' | 'email' | 'whatsapp' etc.
  label: string;
  href: string;
}

export interface ContactConfig {
  heading: string;
  subheading: string;
  links: ContactLink[];
}

export const SOCIAL_MEDIA_TYPES = [
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "github", label: "GitHub" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter / X" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "website", label: "Website" },
] as const;

export interface Experience {
  id: string;
  company: string;
  companyDescription: string;
  position: string;
  period: string;
  location: string;
  description: string;
  companyLogo: string;
  image: string;
  images: string[];
  responsibilities: Responsibility[];
  skills: string[];
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface Responsibility {
  icon: string; // icon name: 'code' | 'database' | 'network'
  title: string;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  techIcons: string[]; // icon names: 'react', 'nodejs', 'express', etc.
  link: string;
  buttonText: string;
  category: "website" | "game";
  aos: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface Certificate {
  id: string;
  title: string;
  description: string;
  images: string[];
  count: number;
  createdAt: number;
  updatedAt: number;
}

// Available icon options for UI selects
export const RESPONSIBILITY_ICONS = [
  { value: "code", label: "Code" },
  { value: "database", label: "Database" },
  { value: "network", label: "Network" },
  { value: "server", label: "Server" },
  { value: "shield", label: "Security" },
  { value: "tool", label: "Tools" },
] as const;

export const TECH_ICONS = [
  { value: "react", label: "React" },
  { value: "nodejs", label: "Node.js" },
  { value: "express", label: "Express" },
  { value: "tailwind", label: "Tailwind CSS" },
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "nextjs", label: "Next.js" },
  { value: "unity", label: "Unity" },
  { value: "csharp", label: "C#" },
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "vue", label: "Vue.js" },
  { value: "angular", label: "Angular" },
  { value: "laravel", label: "Laravel" },
  { value: "php", label: "PHP" },
  { value: "mongodb", label: "MongoDB" },
  { value: "docker", label: "Docker" },
  { value: "git", label: "Git" },
  { value: "firebase", label: "Firebase" },
] as const;

export const PROJECT_AOS_OPTIONS = [
  { value: "fade-left", label: "Fade Left" },
  { value: "fade-right", label: "Fade Right" },
  { value: "fade-up", label: "Fade Up" },
  { value: "fade-down", label: "Fade Down" },
  { value: "flip-left", label: "Flip Left" },
  { value: "flip-right", label: "Flip Right" },
] as const;

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
  color: string; // tailwind gradient classes like 'from-pink-500 to-purple-600'
  description: string;
  category: "social" | "contact"; // social = Follow Me, contact = Quick Contact
}

export interface ContactConfig {
  heading: string;
  subheading: string;
  profileImage: string;
  profileName: string;
  profileTitle: string;
  profileTags: string[]; // e.g. ['React', 'Next.js', 'Node.js']
  footerNote: string;
  contactEmail: string; // for the contact form mailto
  links: ContactLink[];
}

export const CONTACT_LINK_COLORS = [
  { value: "from-pink-500 to-purple-600", label: "Pink-Purple" },
  { value: "from-blue-500 to-blue-700", label: "Blue" },
  { value: "from-gray-600 to-gray-900", label: "Gray" },
  { value: "from-red-500 to-orange-600", label: "Red-Orange" },
  { value: "from-green-500 to-green-600", label: "Green" },
  { value: "from-indigo-500 to-purple-600", label: "Indigo-Purple" },
  { value: "from-teal-500 to-cyan-500", label: "Teal-Cyan" },
  { value: "from-amber-500 to-orange-500", label: "Amber-Orange" },
] as const;

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
  responsibilities: Responsibility[];
  skills: string[];
  badge: string;
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
  createdAt: number;
  updatedAt: number;
}

export interface Certificate {
  id: string;
  title: string;
  description: string;
  images: string[];
  count: number;
  color: string;
  category: string;
  icon: string; // icon name: 'certificate', 'university', 'award', 'gamepad', 'code'
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

export const CERTIFICATE_ICONS = [
  { value: "certificate", label: "Certificate" },
  { value: "university", label: "University" },
  { value: "award", label: "Award" },
  { value: "gamepad", label: "Gamepad" },
  { value: "code", label: "Code" },
] as const;

export const CERTIFICATE_COLORS = [
  { value: "from-blue-500 to-blue-600", label: "Blue" },
  { value: "from-orange-500 to-red-500", label: "Orange-Red" },
  { value: "from-green-500 to-green-600", label: "Green" },
  { value: "from-purple-500 to-pink-500", label: "Purple-Pink" },
  { value: "from-indigo-500 to-purple-600", label: "Indigo-Purple" },
  { value: "from-teal-500 to-cyan-500", label: "Teal-Cyan" },
  { value: "from-rose-500 to-pink-500", label: "Rose-Pink" },
  { value: "from-amber-500 to-orange-500", label: "Amber-Orange" },
] as const;

export const CERTIFICATE_CATEGORIES = [
  { value: "professional", label: "Professional" },
  { value: "cloud", label: "Cloud Computing" },
  { value: "education", label: "Education" },
  { value: "gamedev", label: "Game Development" },
  { value: "webdev", label: "Web Development" },
  { value: "other", label: "Other" },
] as const;

export const PROJECT_AOS_OPTIONS = [
  { value: "fade-left", label: "Fade Left" },
  { value: "fade-right", label: "Fade Right" },
  { value: "fade-up", label: "Fade Up" },
  { value: "fade-down", label: "Fade Down" },
  { value: "flip-left", label: "Flip Left" },
  { value: "flip-right", label: "Flip Right" },
] as const;

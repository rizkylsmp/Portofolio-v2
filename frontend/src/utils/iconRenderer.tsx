// ==========================================
// Icon Renderer - Maps icon string names to React components
// ==========================================

import React from "react";
import {
  FaReact, FaNodeJs, FaUnity, FaCertificate, FaUniversity,
  FaCode, FaGamepad, FaDatabase, FaNetworkWired, FaServer,
  FaShieldAlt, FaTools, FaPython, FaVuejs, FaAngular,
  FaLaravel, FaPhp, FaDocker, FaGitAlt,
} from "react-icons/fa";
import {
  SiExpress, SiTailwindcss, SiMysql, SiSharp, SiPostgresql,
  SiTypescript, SiJavascript, SiMongodb, SiFirebase,
} from "react-icons/si";
import { RiNextjsLine } from "react-icons/ri";
import { BiAward } from "react-icons/bi";

const iconMap: Record<string, React.ReactNode> = {
  // Tech icons
  react: React.createElement(FaReact, { key: "react" }),
  nodejs: React.createElement(FaNodeJs, { key: "nodejs" }),
  express: React.createElement(SiExpress, { key: "express" }),
  tailwind: React.createElement(SiTailwindcss, { key: "tailwind" }),
  mysql: React.createElement(SiMysql, { key: "mysql" }),
  postgresql: React.createElement(SiPostgresql, { key: "postgresql" }),
  nextjs: React.createElement(RiNextjsLine, { key: "nextjs" }),
  unity: React.createElement(FaUnity, { key: "unity" }),
  csharp: React.createElement(SiSharp, { key: "csharp" }),
  typescript: React.createElement(SiTypescript, { key: "typescript" }),
  javascript: React.createElement(SiJavascript, { key: "javascript" }),
  python: React.createElement(FaPython, { key: "python" }),
  vue: React.createElement(FaVuejs, { key: "vue" }),
  angular: React.createElement(FaAngular, { key: "angular" }),
  laravel: React.createElement(FaLaravel, { key: "laravel" }),
  php: React.createElement(FaPhp, { key: "php" }),
  mongodb: React.createElement(SiMongodb, { key: "mongodb" }),
  docker: React.createElement(FaDocker, { key: "docker" }),
  git: React.createElement(FaGitAlt, { key: "git" }),
  firebase: React.createElement(SiFirebase, { key: "firebase" }),

  // Responsibility icons
  code: React.createElement(FaCode, { key: "code" }),
  database: React.createElement(FaDatabase, { key: "database" }),
  network: React.createElement(FaNetworkWired, { key: "network" }),
  server: React.createElement(FaServer, { key: "server" }),
  shield: React.createElement(FaShieldAlt, { key: "shield" }),
  tool: React.createElement(FaTools, { key: "tool" }),

  // Certificate icons
  certificate: React.createElement(FaCertificate, { key: "certificate" }),
  university: React.createElement(FaUniversity, { key: "university" }),
  award: React.createElement(BiAward, { key: "award" }),
  gamepad: React.createElement(FaGamepad, { key: "gamepad" }),
};

export function renderIcon(iconName: string): React.ReactNode {
  return iconMap[iconName] || null;
}

export function renderIcons(iconNames: string[]): React.ReactNode[] {
  return iconNames.map((name) => iconMap[name]).filter(Boolean) as React.ReactNode[];
}

import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const BACKEND_DIR = path.resolve(__dirname, "../..");
export const ROOT_DIR = path.resolve(BACKEND_DIR, "..");

dotenv.config({ path: path.join(BACKEND_DIR, ".env.local"), quiet: true });
dotenv.config({ path: path.join(BACKEND_DIR, ".env"), quiet: true });
dotenv.config({ path: path.join(ROOT_DIR, ".env.local"), quiet: true });
dotenv.config({ path: path.join(ROOT_DIR, ".env"), quiet: true });

const hasMysqlAddon = Boolean(
  process.env.MYSQL_ADDON_HOST && process.env.MYSQL_ADDON_DB
);
const dbHost = process.env.MYSQL_ADDON_HOST || process.env.DB_HOST || "localhost";
const isLocalDatabase = new Set(["localhost", "127.0.0.1", "::1"]).has(
  dbHost.toLowerCase()
);
const isManagedDatabase =
  hasMysqlAddon || process.env.DB_MANAGED === "true" || !isLocalDatabase;
const corsOrigin = (process.env.CORS_ORIGIN || "*").replace(/\/+$/, "");

export const config = {
  rootDir: ROOT_DIR,
  backendDir: BACKEND_DIR,
  distDir: path.join(ROOT_DIR, "frontend", "dist"),
  uploadDir: path.resolve(ROOT_DIR, process.env.UPLOAD_DIR || "backend/uploads"),
  dataPath: path.resolve(
    ROOT_DIR,
    process.env.PORTFOLIO_DATA_PATH || "backend/src/seeds/portfolioData.json"
  ),
  port: Number(process.env.PORT || 3000),
  corsOrigin: corsOrigin || "*",
  adminPassword: process.env.ADMIN_PASSWORD || "",
  adminPin: process.env.ADMIN_PIN || "",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
    folder: process.env.CLOUDINARY_FOLDER || "portfolio-v2",
  },
  db: {
    host: dbHost,
    port: Number(process.env.MYSQL_ADDON_PORT || process.env.DB_PORT || 3306),
    user: process.env.MYSQL_ADDON_USER || process.env.DB_USER || "root",
    password: process.env.MYSQL_ADDON_PASSWORD || process.env.DB_PASSWORD || "",
    name: process.env.MYSQL_ADDON_DB || process.env.DB_NAME || "portfolio_v2",
    managed: isManagedDatabase,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  },
  auth: {
    sessionTtlMs: 12 * 60 * 60 * 1000,
    lockoutDurationMs: 5 * 60 * 1000,
    maxAttempts: 5,
  },
  portfolioRowId: "main",
};

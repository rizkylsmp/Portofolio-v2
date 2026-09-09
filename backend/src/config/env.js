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
  corsOrigin: process.env.CORS_ORIGIN || "*",
  adminPassword: process.env.ADMIN_PASSWORD || "",
  adminPin: process.env.ADMIN_PIN || "",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "portfolio_v2",
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  },
  auth: {
    sessionTtlMs: 12 * 60 * 60 * 1000,
    lockoutDurationMs: 5 * 60 * 1000,
    maxAttempts: 5,
  },
  portfolioRowId: "main",
};

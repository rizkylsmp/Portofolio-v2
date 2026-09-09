import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initializeDatabase } from "../db/init.js";
import { getPool } from "../db/pool.js";
import {
  readPortfolioData,
  readPortfolioSeedData,
  writePortfolioData,
} from "../services/portfolioService.js";
import {
  getImageAsset,
  isCloudinaryConfigured,
  uploadImageBuffer,
} from "../services/cloudinaryService.js";
import { config } from "../config/env.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const imagesRoot = path.resolve(scriptDir, "../../../frontend/public/images");

async function migratePortfolioToCloud() {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary credentials are not configured.");
  }

  const seedData = await readPortfolioSeedData();
  const localUrls = [...collectLocalImageUrls(seedData)].sort();
  const localFiles = new Map();

  for (const url of localUrls) {
    const relativePath = url.slice("/images/".length);
    const filePath = path.join(imagesRoot, ...relativePath.split("/"));
    await fs.access(filePath);
    localFiles.set(url, filePath);
  }

  console.log(`[portfolio-migration] Uploading ${localFiles.size} referenced images.`);
  const cloudUrls = new Map();
  let completed = 0;

  for (const [localUrl, filePath] of localFiles) {
    const relativePath = localUrl.slice("/images/".length);
    const pathParts = relativePath.split("/");
    const target = `migrated/${slugify(pathParts[0] || "assets")}`;
    const baseName = path.basename(relativePath, path.extname(relativePath));
    const hash = crypto.createHash("sha1").update(relativePath).digest("hex").slice(0, 10);
    const publicId = `${slugify(baseName)}-${hash}`;
    const fullPublicId = `${config.cloudinary.folder}/${target}/${publicId}`;
    const result = await getExistingImageAsset(fullPublicId).catch(async () =>
      uploadImageBuffer(await fs.readFile(filePath), target, { publicId })
    );
    cloudUrls.set(localUrl, result.url);
    completed += 1;
    console.log(`[portfolio-migration] Uploaded ${completed}/${localFiles.size}.`);
  }

  const migratedData = replaceLocalImageUrls(seedData, cloudUrls);
  await initializeDatabase();
  await writePortfolioData(migratedData);

  const storedData = await readPortfolioData();
  const remainingLocalUrls = collectLocalImageUrls(storedData);
  if (remainingLocalUrls.size > 0) {
    throw new Error(`${remainingLocalUrls.size} local image URLs remain after migration.`);
  }

  console.log(
    `[portfolio-migration] Complete: ${cloudUrls.size} images uploaded and portfolio data stored in MySQL.`
  );
}

async function getExistingImageAsset(publicId) {
  const result = await getImageAsset(publicId);
  console.log("[portfolio-migration] Reusing an existing Cloudinary asset.");
  return result;
}

function collectLocalImageUrls(value, result = new Set()) {
  if (typeof value === "string") {
    if (value.startsWith("/images/")) result.add(value);
    return result;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectLocalImageUrls(item, result);
    return result;
  }

  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectLocalImageUrls(item, result);
  }

  return result;
}

function replaceLocalImageUrls(value, cloudUrls) {
  if (typeof value === "string") return cloudUrls.get(value) || value;
  if (Array.isArray(value)) return value.map((item) => replaceLocalImageUrls(item, cloudUrls));
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, replaceLocalImageUrls(item, cloudUrls)])
  );
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "asset";
}

migratePortfolioToCloud()
  .catch((error) => {
    console.error("[portfolio-migration] Failed:", error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await getPool().end();
    } catch {
      // The pool is absent when migration fails before database initialization.
    }
  });

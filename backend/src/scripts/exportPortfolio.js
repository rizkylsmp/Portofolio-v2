import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config/env.js";
import { initializeDatabase } from "../db/init.js";
import { getPool } from "../db/pool.js";
import { readPortfolioData } from "../services/portfolioService.js";

const outputPath = path.resolve(
  config.rootDir,
  process.env.PORTFOLIO_EXPORT_PATH || "backend/tmp/localPortfolioExport.json"
);

async function exportPortfolio() {
  await initializeDatabase();
  const data = await readPortfolioData();
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(data, null, 2), "utf-8");

  console.log(
    JSON.stringify({
      outputPath,
      skills: data.skills.length,
      experiences: data.experiences.length,
      projects: data.projects.length,
      certificates: data.certificates.length,
    })
  );
}

exportPortfolio()
  .catch((error) => {
    console.error("[portfolio-export] Failed:", error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await getPool().end();
    } catch {
      // Ignore cleanup when initialization failed before creating the pool.
    }
  });

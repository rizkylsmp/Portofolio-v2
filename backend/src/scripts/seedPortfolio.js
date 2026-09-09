import { initializeDatabase } from "../db/init.js";
import { readPortfolioSeedData, writePortfolioData } from "../services/portfolioService.js";
import { getPool } from "../db/pool.js";

async function seedPortfolio() {
  await initializeDatabase();
  const data = await readPortfolioSeedData();
  await writePortfolioData(data);
  console.log("[portfolio-backend] Portfolio data migrated to MySQL.");
}

seedPortfolio()
  .catch((err) => {
    console.error("[portfolio-backend] Failed to migrate portfolio data:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await getPool().end();
    } catch {
      // Ignore cleanup errors during process shutdown.
    }
  });

import { initializeDatabase } from "../db/init.js";
import { getPool } from "../db/pool.js";

const TABLES = [
  "profile",
  "profile_social_media",
  "skills",
  "experiences",
  "experience_responsibilities",
  "experience_skills",
  "experience_images",
  "projects",
  "project_images",
  "project_tech_icons",
  "certificates",
  "certificate_images",
  "contact",
  "contact_links",
];

async function checkPortfolio() {
  await initializeDatabase();
  const pool = getPool();
  const result = {};

  for (const table of TABLES) {
    const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM ${table}`);
    result[table] = Number(rows[0].count);
  }

  console.log(JSON.stringify(result, null, 2));
}

checkPortfolio()
  .catch((err) => {
    console.error("[portfolio-backend] Failed to check portfolio data:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await getPool().end();
    } catch {
      // Ignore cleanup errors during process shutdown.
    }
  });

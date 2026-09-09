import { getPool, initializePool } from "./pool.js";
import { readInitialPortfolioData, writePortfolioData } from "../services/portfolioService.js";

const INITIALIZATION_ATTEMPTS = 3;
const RETRYABLE_MYSQL_ERRORS = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "EPIPE",
  "PROTOCOL_CONNECTION_LOST",
  "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR",
]);

export async function initializeDatabase() {
  for (let attempt = 1; attempt <= INITIALIZATION_ATTEMPTS; attempt += 1) {
    try {
      await initializePool();
      const pool = getPool();

      await createPortfolioTables(pool);

      if (await isPortfolioEmpty(pool)) {
        const seedData = await readInitialPortfolioData();
        await writePortfolioData(seedData);
        console.log("[portfolio-backend] MySQL normalized tables seeded.");
      }

      return;
    } catch (error) {
      if (attempt === INITIALIZATION_ATTEMPTS || !isRetryableMysqlError(error)) {
        throw error;
      }

      const delayMs = attempt * 500;
      console.warn(
        `[portfolio-backend] MySQL connection interrupted (${error.code}). Retrying in ${delayMs}ms...`
      );
      await wait(delayMs);
    }
  }
}

async function createPortfolioTables(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS profile (
      id TINYINT UNSIGNED NOT NULL PRIMARY KEY DEFAULT 1,
      name VARCHAR(180) NOT NULL,
      position TEXT NOT NULL,
      description TEXT NOT NULL,
      photo TEXT NOT NULL,
      resume_url TEXT NOT NULL,
      resume_label VARCHAR(80) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS profile_social_media (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      type VARCHAR(60) NOT NULL,
      url TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_profile_social_media_order (sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS skills (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      src TEXT NOT NULL,
      alt VARCHAR(160) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_skills_order (sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS experiences (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      company VARCHAR(180) NOT NULL,
      company_description TEXT NOT NULL,
      position VARCHAR(180) NOT NULL,
      period VARCHAR(120) NOT NULL,
      location VARCHAR(180) NOT NULL,
      description TEXT NOT NULL,
      company_logo TEXT NOT NULL,
      image TEXT NOT NULL,
      badge VARCHAR(180) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_experiences_order (sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS experience_responsibilities (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      experience_id BIGINT UNSIGNED NOT NULL,
      icon VARCHAR(80) NOT NULL,
      title VARCHAR(180) NOT NULL,
      description TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_experience_responsibilities_experience
        FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE,
      INDEX idx_experience_responsibilities_order (experience_id, sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS experience_skills (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      experience_id BIGINT UNSIGNED NOT NULL,
      skill VARCHAR(120) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_experience_skills_experience
        FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE,
      INDEX idx_experience_skills_order (experience_id, sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS experience_images (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      experience_id BIGINT UNSIGNED NOT NULL,
      image_url TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_experience_images_experience
        FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE,
      INDEX idx_experience_images_order (experience_id, sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    INSERT INTO experience_images (experience_id, image_url, sort_order)
    SELECT experiences.id, experiences.image, 0
    FROM experiences
    WHERE experiences.image <> ''
      AND NOT EXISTS (
        SELECT 1
        FROM experience_images
        WHERE experience_images.experience_id = experiences.id
      )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(180) NOT NULL,
      description TEXT NOT NULL,
      link TEXT NOT NULL,
      button_text VARCHAR(80) NOT NULL,
      category ENUM('website', 'game') NOT NULL,
      aos VARCHAR(80) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_projects_order (sort_order),
      INDEX idx_projects_category (category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS project_images (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      project_id BIGINT UNSIGNED NOT NULL,
      image_url TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_project_images_project
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      INDEX idx_project_images_order (project_id, sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS project_tech_icons (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      project_id BIGINT UNSIGNED NOT NULL,
      tech_icon VARCHAR(80) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_project_tech_icons_project
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      INDEX idx_project_tech_icons_order (project_id, sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS certificates (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(180) NOT NULL,
      description TEXT NOT NULL,
      count INT NOT NULL DEFAULT 0,
      color VARCHAR(120) NOT NULL,
      category VARCHAR(80) NOT NULL,
      icon VARCHAR(80) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_certificates_order (sort_order),
      INDEX idx_certificates_category (category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS certificate_images (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      certificate_id BIGINT UNSIGNED NOT NULL,
      image_url TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_certificate_images_certificate
        FOREIGN KEY (certificate_id) REFERENCES certificates(id) ON DELETE CASCADE,
      INDEX idx_certificate_images_order (certificate_id, sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact (
      id TINYINT UNSIGNED NOT NULL PRIMARY KEY DEFAULT 1,
      heading VARCHAR(220) NOT NULL,
      subheading TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_links (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      type VARCHAR(60) NOT NULL,
      label VARCHAR(120) NOT NULL,
      href TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_contact_links_order (sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query("DROP TABLE IF EXISTS contact_profile_tags");

  for (const columnName of ["profile_image", "profile_name", "profile_title", "footer_note", "contact_email"]) {
    await dropColumnIfExists(pool, "contact", columnName);
  }

  for (const columnName of ["color", "description", "category"]) {
    await dropColumnIfExists(pool, "contact_links", columnName);
  }

  await pool.query("UPDATE contact SET heading = 'Get In Touch'");
}

async function dropColumnIfExists(pool, tableName, columnName) {
  const [rows] = await pool.query(
    `
      SELECT 1
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      LIMIT 1
    `,
    [tableName, columnName]
  );

  if (rows.length > 0) {
    await pool.query(`ALTER TABLE \`${tableName}\` DROP COLUMN \`${columnName}\``);
  }
}

async function isPortfolioEmpty(pool) {
  const [rows] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM profile) AS profile_count,
      (SELECT COUNT(*) FROM skills) AS skills_count,
      (SELECT COUNT(*) FROM experiences) AS experiences_count,
      (SELECT COUNT(*) FROM projects) AS projects_count,
      (SELECT COUNT(*) FROM certificates) AS certificates_count,
      (SELECT COUNT(*) FROM contact) AS contact_count
  `);

  const counts = Object.values(rows[0]).map(Number);

  return counts.every((count) => count === 0);
}

function isRetryableMysqlError(error) {
  return error && RETRYABLE_MYSQL_ERRORS.has(error.code);
}

function wait(delayMs) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

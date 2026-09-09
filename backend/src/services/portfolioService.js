import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config/env.js";
import { getPool } from "../db/pool.js";

const CHILD_DELETE_ORDER = [
  "profile_social_media",
  "experience_responsibilities",
  "experience_skills",
  "experience_images",
  "project_images",
  "project_tech_icons",
  "certificate_images",
  "contact_links",
];

const PARENT_DELETE_ORDER = ["profile", "skills", "experiences", "projects", "certificates", "contact"];
let portfolioWriteQueue = Promise.resolve();

export async function readPortfolioData() {
  const data = await readStoredPortfolioData();

  if (isEmptyPortfolioData(data)) {
    const seedData = await readInitialPortfolioData();
    await writePortfolioData(seedData);
    return seedData;
  }

  return data;
}

async function readStoredPortfolioData() {
  const pool = getPool();
  const [
    [profileRows],
    [socialRows],
    [skillRows],
    [experienceRows],
    [responsibilityRows],
    [experienceSkillRows],
    [experienceImageRows],
    [projectRows],
    [projectImageRows],
    [projectTechRows],
    [certificateRows],
    [certificateImageRows],
    [contactRows],
    [contactLinkRows],
  ] = await Promise.all([
    pool.query("SELECT * FROM profile WHERE id = 1 LIMIT 1"),
    pool.query("SELECT type, url FROM profile_social_media ORDER BY sort_order ASC, id ASC"),
    pool.query("SELECT name, src, alt, sort_order FROM skills ORDER BY sort_order ASC, id ASC"),
    pool.query("SELECT * FROM experiences ORDER BY sort_order ASC, id ASC"),
    pool.query("SELECT * FROM experience_responsibilities ORDER BY experience_id ASC, sort_order ASC, id ASC"),
    pool.query("SELECT * FROM experience_skills ORDER BY experience_id ASC, sort_order ASC, id ASC"),
    pool.query("SELECT * FROM experience_images ORDER BY experience_id ASC, sort_order ASC, id ASC"),
    pool.query("SELECT * FROM projects ORDER BY sort_order ASC, id ASC"),
    pool.query("SELECT * FROM project_images ORDER BY project_id ASC, sort_order ASC, id ASC"),
    pool.query("SELECT * FROM project_tech_icons ORDER BY project_id ASC, sort_order ASC, id ASC"),
    pool.query("SELECT * FROM certificates ORDER BY sort_order ASC, id ASC"),
    pool.query("SELECT * FROM certificate_images ORDER BY certificate_id ASC, sort_order ASC, id ASC"),
    pool.query("SELECT * FROM contact WHERE id = 1 LIMIT 1"),
    pool.query("SELECT type, label, href FROM contact_links ORDER BY sort_order ASC, id ASC"),
  ]);

  return {
    profile: mapProfile(profileRows[0], socialRows),
    skills: skillRows.map(mapSkill),
    experiences: experienceRows.map((row) => mapExperience(row, responsibilityRows, experienceSkillRows, experienceImageRows)),
    projects: projectRows.map((row) => mapProject(row, projectImageRows, projectTechRows)),
    certificates: certificateRows.map((row) => mapCertificate(row, certificateImageRows)),
    contact: mapContact(contactRows[0], contactLinkRows),
  };
}

export async function readPortfolioSeedData() {
  const raw = await fs.readFile(config.dataPath, "utf-8");
  return JSON.parse(raw);
}

export async function readInitialPortfolioData() {
  return (await readNormalizedLegacyData()) || (await readJsonLegacyData()) || (await readPortfolioSeedData());
}

export function writePortfolioData(data) {
  if (!isValidPortfolioData(data)) {
    return Promise.reject(new Error("Portfolio data tidak lengkap atau tidak valid."));
  }

  return enqueuePortfolioWrite(async () => {
    const currentData = await readStoredPortfolioData();
    return writePortfolioDataSafely(currentData, data);
  });
}

export function patchPortfolioData(patch) {
  if (!isValidPortfolioPatch(patch)) {
    return Promise.reject(new Error("Perubahan portfolio tidak valid."));
  }

  return enqueuePortfolioWrite(async () => {
    const currentData = await readStoredPortfolioData();
    const nextData = { ...currentData, ...patch };
    return writePortfolioDataSafely(currentData, nextData);
  });
}

function enqueuePortfolioWrite(operation) {
  const result = portfolioWriteQueue.then(operation, operation);
  portfolioWriteQueue = result.catch(() => undefined);
  return result;
}

async function writePortfolioDataSafely(currentData, nextData) {
  await backupPortfolioData(currentData);
  assertNoUnexpectedBulkDeletion(currentData, nextData);

  return writePortfolioDataWithRetry(nextData);
}

async function writePortfolioDataWithRetry(data, attemptsLeft = 3) {
  try {
    return await writePortfolioDataOnce(data);
  } catch (err) {
    if (attemptsLeft > 1 && isRetryableMysqlError(err)) {
      await wait(75);
      return writePortfolioDataWithRetry(data, attemptsLeft - 1);
    }

    throw err;
  }
}

async function writePortfolioDataOnce(data) {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    await clearTables(connection);

    if (data.profile) await insertProfile(connection, data.profile);
    if (data.contact) await insertContact(connection, data.contact);

    for (const [index, skill] of (data.skills || []).entries()) {
      await connection.query(
        "INSERT INTO skills (name, src, alt, sort_order) VALUES (?, ?, ?, ?)",
        [skill.name || "", skill.src || "", skill.alt || "", Number(skill.order ?? index)]
      );
    }

    for (const [index, experience] of (data.experiences || []).entries()) {
      await insertExperience(connection, experience, index);
    }

    for (const [index, project] of (data.projects || []).entries()) {
      await insertProject(connection, project, index);
    }

    for (const [index, certificate] of (data.certificates || []).entries()) {
      await insertCertificate(connection, certificate, index);
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function clearTables(connection) {
  for (const tableName of CHILD_DELETE_ORDER) {
    await connection.query(`DELETE FROM ${tableName}`);
  }

  for (const tableName of PARENT_DELETE_ORDER) {
    await connection.query(`DELETE FROM ${tableName}`);
  }
}

async function insertProfile(connection, profile) {
  await connection.query(
    `
      INSERT INTO profile (id, name, position, description, photo, resume_url, resume_label)
      VALUES (1, ?, ?, ?, ?, ?, ?)
    `,
    [
      profile.name || "",
      profile.position || "",
      profile.description || "",
      profile.photo || "",
      profile.resumeUrl || "",
      profile.resumeLabel || "Resume",
    ]
  );

  for (const [index, social] of (profile.socialMedia || []).entries()) {
    await connection.query(
      "INSERT INTO profile_social_media (type, url, sort_order) VALUES (?, ?, ?)",
      [social.type || "", social.url || "", index]
    );
  }
}

async function insertExperience(connection, experience, index) {
  const [result] = await connection.query(
    `
      INSERT INTO experiences
        (company, company_description, position, period, location, description, company_logo, image, badge, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      experience.company || "",
      experience.companyDescription || "",
      experience.position || "",
      experience.period || "",
      experience.location || "",
      experience.description || "",
      experience.companyLogo || "",
      (experience.images || []).find(Boolean) || experience.image || "",
      experience.badge || "",
      index,
    ]
  );

  const experienceId = result.insertId;

  for (const [itemIndex, item] of (experience.responsibilities || []).entries()) {
    await connection.query(
      `
        INSERT INTO experience_responsibilities
          (experience_id, icon, title, description, sort_order)
        VALUES (?, ?, ?, ?, ?)
      `,
      [experienceId, item.icon || "", item.title || "", item.description || "", itemIndex]
    );
  }

  for (const [skillIndex, skill] of (experience.skills || []).entries()) {
    await connection.query(
      "INSERT INTO experience_skills (experience_id, skill, sort_order) VALUES (?, ?, ?)",
      [experienceId, skill || "", skillIndex]
    );
  }

  const experienceImages = Array.isArray(experience.images)
    ? experience.images.filter(Boolean)
    : experience.image
      ? [experience.image]
      : [];

  for (const [imageIndex, imageUrl] of experienceImages.entries()) {
    await connection.query(
      "INSERT INTO experience_images (experience_id, image_url, sort_order) VALUES (?, ?, ?)",
      [experienceId, imageUrl || "", imageIndex]
    );
  }
}

async function insertProject(connection, project, index) {
  const [result] = await connection.query(
    `
      INSERT INTO projects
        (title, description, link, button_text, category, aos, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      project.title || "",
      project.description || "",
      project.link || "",
      project.buttonText || "View",
      project.category === "game" ? "game" : "website",
      project.aos || "fade-up",
      Number(project.order ?? index),
    ]
  );

  const projectId = result.insertId;

  for (const [imageIndex, imageUrl] of (project.images || []).entries()) {
    await connection.query(
      "INSERT INTO project_images (project_id, image_url, sort_order) VALUES (?, ?, ?)",
      [projectId, imageUrl || "", imageIndex]
    );
  }

  for (const [techIndex, techIcon] of (project.techIcons || []).entries()) {
    await connection.query(
      "INSERT INTO project_tech_icons (project_id, tech_icon, sort_order) VALUES (?, ?, ?)",
      [projectId, techIcon || "", techIndex]
    );
  }
}

async function insertCertificate(connection, certificate, index) {
  const [result] = await connection.query(
    `
      INSERT INTO certificates
        (title, description, count, color, category, icon, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      certificate.title || "",
      certificate.description || "",
      Number(certificate.count || (certificate.images || []).length || 0),
      certificate.color || "",
      certificate.category || "other",
      certificate.icon || "certificate",
      index,
    ]
  );

  const certificateId = result.insertId;

  for (const [imageIndex, imageUrl] of (certificate.images || []).entries()) {
    await connection.query(
      "INSERT INTO certificate_images (certificate_id, image_url, sort_order) VALUES (?, ?, ?)",
      [certificateId, imageUrl || "", imageIndex]
    );
  }
}

async function insertContact(connection, contact) {
  await connection.query(
    `
      INSERT INTO contact
        (id, heading, subheading)
      VALUES (1, ?, ?)
    `,
    [
      contact.heading || "",
      contact.subheading || "",
    ]
  );

  for (const [linkIndex, link] of (contact.links || []).entries()) {
    await connection.query(
      `
        INSERT INTO contact_links
          (type, label, href, sort_order)
        VALUES (?, ?, ?, ?)
      `,
      [
        link.type || "",
        link.label || "",
        link.href || "",
        linkIndex,
      ]
    );
  }
}

function mapProfile(row, socialRows) {
  if (!row) return null;
  return {
    name: row.name,
    position: row.position,
    description: row.description,
    photo: row.photo,
    socialMedia: socialRows.map((social) => ({
      type: social.type,
      url: social.url,
    })),
    resumeUrl: row.resume_url,
    resumeLabel: row.resume_label,
  };
}

function mapSkill(row) {
  return {
    name: row.name,
    src: row.src,
    alt: row.alt,
    order: Number(row.sort_order || 0),
  };
}

function mapExperience(row, responsibilityRows, skillRows, imageRows) {
  const images = imageRows
    .filter((item) => Number(item.experience_id) === Number(row.id))
    .map((item) => item.image_url)
    .filter(Boolean);
  const normalizedImages = images.length > 0 ? images : row.image ? [row.image] : [];

  return {
    company: row.company,
    companyDescription: row.company_description,
    position: row.position,
    period: row.period,
    location: row.location,
    description: row.description,
    companyLogo: row.company_logo,
    image: row.image || normalizedImages[0] || "",
    images: normalizedImages,
    order: Number(row.sort_order || 0),
    responsibilities: responsibilityRows
      .filter((item) => Number(item.experience_id) === Number(row.id))
      .map((item) => ({
        icon: item.icon,
        title: item.title,
        description: item.description,
      })),
    skills: skillRows
      .filter((item) => Number(item.experience_id) === Number(row.id))
      .map((item) => item.skill),
    badge: row.badge,
  };
}

function mapProject(row, imageRows, techRows) {
  return {
    title: row.title,
    description: row.description,
    images: imageRows
      .filter((item) => Number(item.project_id) === Number(row.id))
      .map((item) => item.image_url),
    techIcons: techRows
      .filter((item) => Number(item.project_id) === Number(row.id))
      .map((item) => item.tech_icon),
    link: row.link,
    buttonText: row.button_text,
    category: row.category,
    aos: row.aos,
    order: Number(row.sort_order || 0),
  };
}

function mapCertificate(row, imageRows) {
  return {
    title: row.title,
    description: row.description,
    images: imageRows
      .filter((item) => Number(item.certificate_id) === Number(row.id))
      .map((item) => item.image_url),
    count: Number(row.count || 0),
  };
}

function mapContact(row, linkRows) {
  if (!row) return null;
  return {
    heading: row.heading,
    subheading: row.subheading,
    links: linkRows.map((link) => ({
      type: link.type,
      label: link.label,
      href: link.href,
    })),
  };
}

async function readNormalizedLegacyData() {
  const pool = getPool();
  const [tableRows] = await pool.query("SHOW TABLES LIKE 'portfolio_profile'");
  if (tableRows.length === 0) return null;

  const [rows] = await pool.query("SELECT COUNT(*) AS count FROM portfolio_profile");
  if (Number(rows[0].count) === 0) return null;

  const [
    [profileRows],
    [skillRows],
    [experienceRows],
    [projectRows],
    [certificateRows],
    [contactRows],
  ] = await Promise.all([
    pool.query("SELECT data FROM portfolio_profile WHERE id = 'main' LIMIT 1"),
    pool.query("SELECT name, src, alt, sort_order FROM portfolio_skills ORDER BY sort_order ASC, id ASC"),
    pool.query("SELECT data FROM portfolio_experiences ORDER BY sort_order ASC, id ASC"),
    pool.query("SELECT data FROM portfolio_projects ORDER BY sort_order ASC, id ASC"),
    pool.query("SELECT data FROM portfolio_certificates ORDER BY sort_order ASC, id ASC"),
    pool.query("SELECT data FROM portfolio_contact WHERE id = 'main' LIMIT 1"),
  ]);

  return {
    profile: parseJsonColumn(profileRows[0]?.data) || null,
    skills: skillRows.map(mapSkill),
    experiences: experienceRows.map((row) => parseJsonColumn(row.data)),
    projects: projectRows.map((row) => parseJsonColumn(row.data)),
    certificates: certificateRows.map((row) => parseJsonColumn(row.data)),
    contact: parseJsonColumn(contactRows[0]?.data) || null,
  };
}

async function readJsonLegacyData() {
  const pool = getPool();
  const [tableRows] = await pool.query("SHOW TABLES LIKE 'portfolio_content'");
  if (tableRows.length === 0) return null;

  const [rows] = await pool.query(
    "SELECT data FROM portfolio_content WHERE id = ? LIMIT 1",
    [config.portfolioRowId]
  );

  if (rows.length === 0) return null;
  return parseJsonColumn(rows[0].data);
}

function parseJsonColumn(value) {
  if (!value) return null;
  return typeof value === "string" ? JSON.parse(value) : value;
}

function isRetryableMysqlError(err) {
  return err?.code === "ER_LOCK_DEADLOCK" || err?.code === "ER_LOCK_WAIT_TIMEOUT";
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isValidPortfolioData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;

  const requiredKeys = ["profile", "skills", "experiences", "projects", "certificates", "contact"];
  if (!requiredKeys.every((key) => Object.hasOwn(data, key))) return false;

  return (
    Array.isArray(data.skills) &&
    Array.isArray(data.experiences) &&
    Array.isArray(data.projects) &&
    Array.isArray(data.certificates) &&
    (data.profile === null || typeof data.profile === "object") &&
    (data.contact === null || typeof data.contact === "object")
  );
}

function isValidPortfolioPatch(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;

  const allowedKeys = new Set([
    "profile",
    "skills",
    "experiences",
    "projects",
    "certificates",
    "contact",
  ]);
  const keys = Object.keys(data);
  if (keys.length === 0 || keys.some((key) => !allowedKeys.has(key))) return false;

  return (
    (!Object.hasOwn(data, "skills") || Array.isArray(data.skills)) &&
    (!Object.hasOwn(data, "experiences") || Array.isArray(data.experiences)) &&
    (!Object.hasOwn(data, "projects") || Array.isArray(data.projects)) &&
    (!Object.hasOwn(data, "certificates") || Array.isArray(data.certificates)) &&
    (!Object.hasOwn(data, "profile") || data.profile === null || typeof data.profile === "object") &&
    (!Object.hasOwn(data, "contact") || data.contact === null || typeof data.contact === "object")
  );
}

async function backupPortfolioData(data) {
  if (isEmptyPortfolioData(data)) return;

  const backupDir = path.join(config.backendDir, "backups");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  await fs.mkdir(backupDir, { recursive: true });
  await fs.writeFile(
    path.join(backupDir, `portfolio-${timestamp}.json`),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

function assertNoUnexpectedBulkDeletion(currentData, nextData) {
  const sections = [
    ["profile", currentData.profile ? 1 : 0, nextData.profile ? 1 : 0],
    ["skills", currentData.skills.length, nextData.skills.length],
    ["experiences", currentData.experiences.length, nextData.experiences.length],
    ["projects", currentData.projects.length, nextData.projects.length],
    ["certificates", currentData.certificates.length, nextData.certificates.length],
    ["contact", currentData.contact ? 1 : 0, nextData.contact ? 1 : 0],
  ];
  const clearedSections = sections
    .filter(([, currentCount, nextCount]) => currentCount > 0 && nextCount === 0)
    .map(([name]) => name);

  if (clearedSections.length > 1) {
    throw new Error(
      `Penyimpanan dibatalkan karena akan mengosongkan beberapa bagian sekaligus: ${clearedSections.join(
        ", "
      )}. Muat ulang halaman admin lalu coba lagi.`
    );
  }
}

function isEmptyPortfolioData(data) {
  return (
    !data.profile &&
    !data.contact &&
    data.skills.length === 0 &&
    data.experiences.length === 0 &&
    data.projects.length === 0 &&
    data.certificates.length === 0
  );
}

import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";
import { validatePortfolio } from "../validation/portfolio.js";
import seed from "../seeds/portfolioData.json" with { type: "json" };
import { readFile } from "node:fs/promises";

let tables, sessions, attempts, statements, failInsert;
let lock = Promise.resolve();
const tableNames = ["profile", "profile_social_media", "skills", "experiences", "experience_responsibilities", "experience_skills", "experience_images", "projects", "project_images", "project_tech_icons", "certificates", "certificate_images", "contact", "contact_links", "portfolio_backups"];
async function query(sql, values = []) {
  statements.push(sql);
  if (sql.includes("admin_sessions")) {
    if (sql.startsWith("INSERT")) sessions.set(values[0], values[1]);
    if (sql.startsWith("DELETE") && sql.includes("token_hash")) sessions.delete(values[0]);
    if (sql.startsWith("DELETE") && sql.includes("expires_at")) for (const [key, expires] of sessions) { if (expires <= values[0]) sessions.delete(key); }
    if (sql.startsWith("UPDATE")) {
      const valid = (sessions.get(values[1]) || 0) > values[2];
      if (valid) sessions.set(values[1], values[0]);
      return [{ affectedRows: valid ? 1 : 0 }];
    }
    return [{ affectedRows: 1 }];
  }
  if (sql.includes("admin_login_attempts")) {
    if (sql.startsWith("DELETE") && !sql.includes("client_key")) {
      for (const [key, record] of attempts) if (record.locked_until <= values[0] && record.updated_at <= values[1]) attempts.delete(key);
      return [{ affectedRows: 1 }];
    }
    const key = values[0], record = attempts.get(key);
    if (sql.startsWith("SELECT")) return [record ? [structuredClone(record)] : []];
    if (sql.startsWith("DELETE") && (!sql.includes("locked_until") || (record?.locked_until <= values[1] && record?.updated_at <= values[2]))) attempts.delete(key);
    if (sql.startsWith("INSERT")) {
      const count = !record || (record.updated_at <= values[2] && record.locked_until <= values[3]) ? 1 : record.attempts + 1;
      attempts.set(key, { attempts: count, locked_until: count >= values[4] ? values[5] : record?.locked_until || 0, updated_at: values[1] });
    }
    return [{ affectedRows: 1 }];
  }
  if (sql.includes("portfolio_write_lock")) return [[{ id: 1 }]];
  const table = sql.match(/(?:FROM|INTO)\s+(\w+)/)?.[1];
  if (sql.startsWith("SELECT")) {
    let rows = tables[table];
    if (sql.includes("COUNT(*)")) return [[{ count: rows.length }]];
    if (sql.includes("WHERE id = ?")) rows = rows.filter((row) => String(row.id) === String(values[0]));
    return [structuredClone(rows)];
  }
  if (sql.startsWith("DELETE")) {
    tables[table] = table === "portfolio_backups" ? tables[table].slice(-30) : [];
    return [{ affectedRows: 1 }];
  }
  if (/INSERT\s+INTO/.test(sql)) {
    if (failInsert === table) { failInsert = null; throw new Error("Simulated database failure"); }
    const columns = sql.match(/\(([^)]+)\)/)[1].split(",").map((column) => column.trim());
    let index = 0;
    const row = Object.fromEntries(columns.map((column) => [column, column === "id" ? 1 : values[index++]]));
    row.id ||= tables[table].length + 1;
    tables[table].push(row);
    return [{ insertId: row.id }];
  }
  throw new Error(`Unexpected SQL: ${sql}`);
}
const pool = { query, getConnection: async () => {
  let snapshot, unlock;
  const release = () => { unlock?.(); unlock = null; };
  return {
    query: async (sql, values) => {
      if (sql.includes("FOR UPDATE")) {
        const previous = lock;
        lock = new Promise((resolve) => { unlock = resolve; });
        await previous;
        snapshot = structuredClone(tables);
      }
      return query(sql, values);
    },
    beginTransaction: async () => {}, commit: async () => { release(); },
    rollback: async () => { if (snapshot) tables = snapshot; release(); }, release,
  };
} };
mock.module("../db/pool.js", { namedExports: { getPool: () => pool } });
const portfolio = await import("./portfolioService.js");
const anotherPortfolioInstance = await import("./portfolioService.js?instance=second");
const auth = await import("./authService.js");
const anotherInstance = await import("./authService.js?instance=second");
const backups = await import("./backupService.js");
const { createApp } = await import("../createApp.js");
beforeEach(() => {
  tables = Object.fromEntries(tableNames.map((table) => [table, []]));
  const p = seed.profile;
  tables.profile = [{ id: 1, name: p.name, position: p.position, description: p.description, photo: p.photo, resume_url: p.resumeUrl, resume_label: p.resumeLabel }];
  sessions = new Map(); attempts = new Map(); statements = []; failInsert = null; lock = Promise.resolve();
});

test("nested import validation rejects missing sections, malformed items and unsafe URLs", () => {
  assert.doesNotThrow(() => validatePortfolio(seed));
  assert.throws(() => validatePortfolio({}), /profile/);
  assert.throws(() => validatePortfolio({ projects: [{ ...seed.projects[0], title: "" }] }, true), /title/);
  for (const photo of ["javascript:alert(1)", "data:image/png;base64,abc", "//evil.test/x", "/\\evil.test"]) {
    assert.throws(() => validatePortfolio({ profile: { ...seed.profile, photo } }, true), /URL/);
  }
  assert.throws(() => validatePortfolio({ skills: [{ name: "x".repeat(121), src: "", alt: "", order: 0 }] }, true), /name/);
});

test("independently deployed FE and BE enforce identical validation schemas", async () => {
  const backend = await readFile(new URL("../validation/portfolio.js", import.meta.url), "utf8");
  const frontend = await readFile(new URL("../../../frontend/src/validation/portfolio.js", import.meta.url), "utf8");
  assert.equal(frontend.replace(/\r\n/g, "\n"), backend.replace(/\r\n/g, "\n"));
});

test("saving profile only touches profile tables and creates a durable snapshot", async () => {
  const current = await portfolio.readPortfolioData();
  const result = await portfolio.patchPortfolioData({ profile: { ...current.profile, name: "Updated" }, _versions: portfolio.portfolioVersions(current) });
  assert.equal((await portfolio.readPortfolioData()).profile.name, "Updated");
  assert.notEqual(result._versions.profile, portfolio.portfolioVersions(current).profile);
  assert.ok(statements.some((sql) => sql.includes("FOR UPDATE")));
  assert.ok(!statements.some((sql) => sql === "DELETE FROM projects"));
  assert.equal(JSON.parse(tables.portfolio_backups[0].data).profile.name, current.profile.name);
});

test("stale or missing versions fail with 409; unrelated sections may still save", async () => {
  const current = await portfolio.readPortfolioData();
  const versions = portfolio.portfolioVersions(current);
  await portfolio.patchPortfolioData({ profile: { ...current.profile, name: "First tab" }, _versions: versions });
  await assert.rejects(portfolio.patchPortfolioData({ profile: current.profile, _versions: versions }), { status: 409 });
  await assert.rejects(portfolio.patchPortfolioData({ profile: current.profile }), { status: 409 });
  await portfolio.patchPortfolioData({ contact: seed.contact, _versions: versions });
  assert.equal((await portfolio.readPortfolioData()).profile.name, "First tab");
});

test("database failure rolls back the data and backup together", async () => {
  const current = await portfolio.readPortfolioData();
  failInsert = "profile";
  await assert.rejects(portfolio.patchPortfolioData({ profile: { ...current.profile, name: "Failed" }, _versions: portfolio.portfolioVersions(current) }), /Simulated/);
  assert.deepEqual(await portfolio.readPortfolioData(), current);
  assert.equal(tables.portfolio_backups.length, 0);
});

test("independent server instances serialize writes and reject concurrent stale edits", async () => {
  const current = await portfolio.readPortfolioData();
  const versions = portfolio.portfolioVersions(current);
  const results = await Promise.allSettled([
    portfolio.patchPortfolioData({ profile: { ...current.profile, name: "Instance A" }, _versions: versions }),
    anotherPortfolioInstance.patchPortfolioData({ profile: { ...current.profile, name: "Instance B" }, _versions: versions }),
  ]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(results.find((result) => result.status === "rejected").reason.status, 409);
  assert.equal(tables.portfolio_backups.length, 1);
});

test("full replacement cannot clear multiple sections without explicit confirmation", async () => {
  let current = await portfolio.readPortfolioData();
  await portfolio.patchPortfolioData({ contact: seed.contact, _versions: portfolio.portfolioVersions(current) });
  current = await portfolio.readPortfolioData();
  const patch = { ...current, profile: null, contact: null, _versions: portfolio.portfolioVersions(current) };
  await assert.rejects(portfolio.patchPortfolioData(patch), { status: 400 });
  assert.deepEqual(await portfolio.readPortfolioData(), current);
  await portfolio.patchPortfolioData({ ...patch, _replaceConfirmed: true });
  assert.equal((await portfolio.readPortfolioData()).profile, null);
});

test("startup seeding cannot overwrite data that appeared after the initial empty check", async () => {
  const current = await portfolio.readPortfolioData();
  await portfolio.writePortfolioData(seed, { onlyIfEmpty: true });
  assert.deepEqual(await portfolio.readPortfolioData(), current);
});

test("database bootstrap does not reset user-authored contact headings", async () => {
  const bootstrap = await readFile(new URL("../db/init.js", import.meta.url), "utf8");
  assert.doesNotMatch(bootstrap, /UPDATE\s+contact\s+SET\s+heading/i);
});

test("confirmed restore validates a snapshot and preserves a backup of current data", async () => {
  const current = await portfolio.readPortfolioData();
  await portfolio.patchPortfolioData({ profile: { ...current.profile, name: "New" }, _versions: portfolio.portfolioVersions(current) });
  const snapshot = await backups.readPortfolioBackup("1");
  const latest = await portfolio.readPortfolioData();
  await portfolio.patchPortfolioData({ ...snapshot, _versions: portfolio.portfolioVersions(latest), _replaceConfirmed: true });
  assert.deepEqual(await portfolio.readPortfolioData(), current);
  assert.equal(JSON.parse(tables.portfolio_backups[1].data).profile.name, "New");
  await assert.rejects(backups.readPortfolioBackup("bad"), { status: 400 });
  await assert.rejects(backups.readPortfolioBackup("999"), { status: 404 });
});

test("retains only the latest 30 backups", async () => {
  for (let index = 0; index < 32; index++) {
    const current = await portfolio.readPortfolioData();
    await portfolio.patchPortfolioData({ profile: { ...current.profile, name: `Revision ${index}` }, _versions: portfolio.portfolioVersions(current) });
  }
  assert.equal(tables.portfolio_backups.length, 30);
});

test("sessions persist between instances, store only hashes, expire and revoke", async () => {
  const token = await auth.createSession();
  assert.equal(sessions.has(token), false);
  assert.equal(await anotherInstance.refreshSession(token), true);
  sessions.set(auth.hashAuthKey(token), Date.now() - 1);
  assert.equal(await auth.refreshSession(token), false);
  const active = await anotherInstance.createSession();
  await auth.deleteSession(active);
  assert.equal(await anotherInstance.refreshSession(active), false);
  assert.equal(await auth.refreshSession("invalid"), false);
});

test("failed login counters and lockout are shared across instances", async () => {
  for (let index = 0; index < 5; index++) await (index % 2 ? auth : anotherInstance).recordFailedLogin("qa-client");
  assert.equal((await auth.getLockout("qa-client")).locked, true);
  await anotherInstance.clearFailedLogin("qa-client");
  assert.equal((await auth.getLockout("qa-client")).attemptsLeft, 5);
});

test("HTTP admin contracts reject unauthorized, invalid, and stale writes and allow confirmed restore", async () => {
  const server = createApp().listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const token = await auth.createSession();
  const send = (path, method, body, authorized = true) => fetch(`${base}${path}`, {
    method, headers: { "Content-Type": "application/json", ...(authorized ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  try {
    const current = await (await fetch(`${base}/portfolio`)).json();
    assert.equal((await send("/admin/portfolio", "PATCH", { profile: current.profile }, false)).status, 401);
    assert.equal((await send("/admin/portfolio", "PUT", seed)).status, 409);
    assert.equal((await send("/admin/portfolio", "PATCH", { projects: [{}], _versions: current._versions })).status, 400);
    const write = await send("/admin/portfolio", "PATCH", { profile: { ...current.profile, name: "HTTP update" }, _versions: current._versions });
    assert.equal(write.status, 200);
    const latest = await write.json();
    assert.ok(latest._versions.profile);
    assert.equal((await send("/admin/backups", "GET")).status, 200);
    assert.equal((await send("/admin/backups/1/restore", "POST", { _versions: latest._versions })).status, 400);
    assert.equal((await send("/admin/backups/1/restore", "POST", { confirmed: true, _versions: latest._versions })).status, 200);
    assert.equal((await portfolio.readPortfolioData()).profile.name, current.profile.name);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});

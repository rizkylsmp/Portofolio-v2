import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { backupPortfolioData, getPortfolioBackupDirectory } from "./portfolioService.js";

test("detects deployed Express paths even without the VERCEL flag", () => {
  const temporary = path.join(os.tmpdir(), "portfolio-backups");
  assert.equal(getPortfolioBackupDirectory("/var/task/backend", {}), temporary);
  assert.equal(getPortfolioBackupDirectory("/var/task", {}), temporary);
  assert.equal(getPortfolioBackupDirectory("/app/backend", { AWS_LAMBDA_FUNCTION_NAME: "portfolio" }), temporary);
  assert.equal(getPortfolioBackupDirectory("/app/backend", { LAMBDA_TASK_ROOT: "/app" }), temporary);
  assert.equal(getPortfolioBackupDirectory("/local/backend", {}), path.join("/local/backend", "backups"));
});

test("falls back on deployment filesystem errors but still requires a backup", async (t) => {
  const original = fs.mkdir.bind(fs);
  let calls = 0;
  t.mock.method(fs, "mkdir", async (...args) => {
    calls += 1;
    if (calls === 1) throw Object.assign(new Error("Read-only deployment"), { code: "ENOENT" });
    return original(...args);
  });
  await backupPortfolioData({ profile: { name: "fallback-test" }, contact: null, skills: [], experiences: [], projects: [], certificates: [] });
  assert.equal(calls, 2);
});

test("serverless backups use writable temporary storage", async () => {
  const previous = process.env.VERCEL;
  process.env.VERCEL = "1";
  const marker = `backup-test-${Date.now()}`;
  const dir = path.join(os.tmpdir(), "portfolio-backups");
  let backup;
  try {
    await backupPortfolioData({ profile: { name: marker }, contact: null, skills: [], experiences: [], projects: [], certificates: [] });
    for (const file of await fs.readdir(dir)) {
      const candidate = path.join(dir, file);
      if ((await fs.readFile(candidate, "utf8")).includes(marker)) { backup = candidate; break; }
    }
    assert.ok(backup);
    assert.equal(JSON.parse(await fs.readFile(backup, "utf8")).profile.name, marker);
  } finally {
    if (backup) await fs.unlink(backup);
    if (previous === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previous;
  }
});

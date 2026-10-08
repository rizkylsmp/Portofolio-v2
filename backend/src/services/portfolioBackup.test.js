import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { backupPortfolioData } from "./portfolioService.js";

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

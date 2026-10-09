import assert from "node:assert/strict";
import { mock, test } from "node:test";

const capacityError = Object.assign(new Error("User qa has exceeded max_user_connections"), { code: "ER_USER_LIMIT_REACHED" });
mock.module("../db/pool.js", { namedExports: { getPool: () => ({ getConnection: async () => { throw capacityError; } }) } });
const { createApp } = await import("../createApp.js");
async function withServer(app, run) {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  try { await run(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise((resolve) => server.close(resolve)); }
}
test("robots, favicon, and preflight requests never initialize the database", async () => {
  let initializations = 0;
  await withServer(createApp({ beforeRoutes: (_req, _res, next) => { initializations += 1; next(capacityError); } }), async (base) => {
    for (const path of ["/robots.txt", "/favicon.ico"]) {
      assert.notEqual((await fetch(`${base}${path}`)).status, 503);
    }
    await fetch(`${base}/api/portfolio`, { method: "OPTIONS" });
    assert.equal(initializations, 0);
    const response = await fetch(`${base}/api/portfolio`);
    assert.equal(initializations, 1);
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("retry-after"), "2");
    assert.equal((await response.json()).code, "DATABASE_CONNECTION_LIMIT");
  });
});
test("capacity failures after bootstrap also return safe 503 instead of a generic 500", async () => {
  await withServer(createApp(), async (base) => {
    const response = await fetch(`${base}/api/portfolio`);
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("retry-after"), "2");
    const body = await response.json();
    assert.equal(body.code, "DATABASE_CONNECTION_LIMIT");
    assert.ok(!JSON.stringify(body).includes("User qa"));
  });
});

import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";

let acquired, released, statements, failure;
const connection = {
  query: async (sql) => {
    statements.push(sql);
    if (failure) throw failure;
    if (sql.includes("AS profile_count")) return [[{ profile_count: 1 }]];
    return [[]];
  },
  release: () => { released += 1; },
};
const pool = {
  getConnection: async () => { acquired += 1; return connection; },
  query: async () => { assert.fail("Bootstrap must use its borrowed connection"); },
};
mock.module("./pool.js", { namedExports: { getPool: () => pool, initializePool: async () => pool } });
mock.module("../services/portfolioService.js", { namedExports: {
  readInitialPortfolioData: async () => { assert.fail("Existing data must not be seeded"); },
  writePortfolioData: async () => { assert.fail("Existing data must not be rewritten"); },
} });
const { initializeDatabase } = await import("./init.js");
beforeEach(() => { acquired = 0; released = 0; statements = []; failure = null; });

test("schema bootstrap uses one borrowed connection for all queries, then releases it", async () => {
  await initializeDatabase();
  assert.equal(acquired, 1);
  assert.equal(released, 1);
  assert.ok(statements.length >= 20);
});

test("schema bootstrap releases its connection when creation fails", async () => {
  failure = Object.assign(new Error("Permission denied"), { code: "ER_TABLEACCESS_DENIED_ERROR" });
  await assert.rejects(initializeDatabase(), (error) => error === failure);
  assert.equal(acquired, 1);
  assert.equal(released, 1);
});

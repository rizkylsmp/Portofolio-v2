import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { mock, test } from "node:test";

let created = 0, ended = 0;
const rawPool = new EventEmitter();
const connection = { query: async () => [[]], release() {}, destroy() {} };
rawPool.getConnection = async () => connection;
rawPool.end = async () => { ended += 1; };
mock.module("mysql2/promise", { defaultExport: { createPool: () => { created += 1; return rawPool; } } });
mock.module("../config/env.js", { namedExports: { config: { db: { managed: true, connectionLimit: 1 } } } });
const { initializePool, getPool } = await import("./pool.js");

test("concurrent and repeated initialization reuse one pool without closing an active borrower", async () => {
  const [first, second] = await Promise.all([initializePool(), initializePool()]);
  assert.equal(first, second);
  const borrowed = await first.getConnection();
  assert.equal(await initializePool(), first);
  assert.equal(getPool(), first);
  assert.equal(borrowed, connection);
  assert.equal(created, 1);
  assert.equal(ended, 0);
});

import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { test } from "node:test";
import { createManagedPool, isConnectionCapacityError } from "./managedPool.js";

const capacityError = () => Object.assign(new Error("User has exceeded max_user_connections"), { code: "ER_USER_LIMIT_REACHED", errno: 1226 });
function fixture() {
  const pool = new EventEmitter();
  let acquired = 0, released = 0, destroyed = 0, queries = 0;
  const connection = {
    query: async () => { queries += 1; return [[{ ok: true }]]; },
    release: () => { released += 1; pool.emit("release", connection); },
    destroy: () => { destroyed += 1; },
  };
  pool.getConnection = async () => { acquired += 1; return connection; };
  pool.end = async () => {};
  return { pool, connection, counts: () => ({ acquired, released, destroyed, queries }) };
}

test("managed connections close immediately at idle release, without relying on a timer", async () => {
  const f = fixture();
  const pool = createManagedPool(f.pool);
  const connection = await pool.getConnection();
  assert.equal(f.counts().destroyed, 0);
  await connection.query("SELECT 1");
  assert.equal(f.counts().destroyed, 0);
  connection.release();
  assert.deepEqual(f.counts(), { acquired: 1, released: 1, destroyed: 1, queries: 1 });
});

test("only idle connections close; a queued borrower keeps the active connection", async () => {
  const f = fixture();
  createManagedPool(f.pool);
  // mysql2 does not emit release when it hands the connection to a queued job.
  f.pool.emit("acquire", f.connection);
  assert.equal(f.counts().destroyed, 0);
  f.pool.emit("release", f.connection);
  assert.equal(f.counts().destroyed, 1);
});

test("query releases connections even when SQL fails, and never retries SQL writes", async () => {
  const f = fixture();
  let calls = 0;
  f.connection.query = async () => { calls += 1; throw capacityError(); };
  const pool = createManagedPool(f.pool);
  await assert.rejects(pool.query("INSERT INTO profile VALUES (?)", ["draft"]), { code: "ER_USER_LIMIT_REACHED" });
  assert.equal(calls, 1);
  assert.equal(f.counts().released, 1);
  assert.equal(f.counts().destroyed, 1);
});

test("connection acquisition retries capacity errors with bounded backoff before executing SQL once", async () => {
  const f = fixture();
  const delays = [];
  let attempts = 0;
  f.pool.getConnection = async () => { if (++attempts < 3) throw capacityError(); return f.connection; };
  const pool = createManagedPool(f.pool, { wait: async (ms) => { delays.push(ms); }, random: () => 0 });
  assert.deepEqual(await pool.query("SELECT 1"), [[{ ok: true }]]);
  assert.deepEqual(delays, [250, 500]);
  assert.equal(attempts, 3);
  assert.equal(f.counts().queries, 1);
});

test("persistent capacity limits stop after four attempts and propagate the original error", async () => {
  const f = fixture();
  const error = capacityError();
  let attempts = 0;
  const delays = [];
  f.pool.getConnection = async () => { attempts += 1; throw error; };
  const pool = createManagedPool(f.pool, { wait: async (ms) => { delays.push(ms); }, random: () => 0 });
  await assert.rejects(pool.getConnection(), (err) => err === error);
  assert.equal(attempts, 4);
  assert.deepEqual(delays, [250, 500, 1000]);
});

test("authentication and non-concurrent resource limits are not retried", async () => {
  const f = fixture();
  const error = Object.assign(new Error("Access denied"), { code: "ER_ACCESS_DENIED_ERROR" });
  let attempts = 0;
  f.pool.getConnection = async () => { attempts += 1; throw error; };
  const pool = createManagedPool(f.pool, { wait: async () => { assert.fail("Unexpected retry"); } });
  await assert.rejects(pool.getConnection(), (err) => err === error);
  assert.equal(attempts, 1);
  assert.equal(isConnectionCapacityError({ code: "ER_USER_LIMIT_REACHED", message: "max_queries_per_hour exceeded" }), false);
});

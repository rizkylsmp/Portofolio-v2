import assert from "node:assert/strict";
import { mock, test } from "node:test";

mock.module("dotenv", { defaultExport: { config: () => ({}) } });
const keys = ["DB_HOST", "DB_MANAGED", "DB_CONNECTION_LIMIT", "MYSQL_ADDON_HOST", "MYSQL_ADDON_DB"];
async function loadConfig(values, suffix) {
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  try {
    for (const key of keys) {
      if (Object.hasOwn(values, key)) process.env[key] = values[key]; else delete process.env[key];
    }
    return (await import(`../config/env.js?case=${suffix}`)).config.db;
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key];
    }
  }
}
test("remote DB_HOST configuration is capped at one connection even without addon variables", async () => {
  const db = await loadConfig({ DB_HOST: "remote.example.test", DB_CONNECTION_LIMIT: "10" }, "remote");
  assert.equal(db.managed, true);
  assert.equal(db.connectionLimit, 1);
});
test("MYSQL_ADDON and explicit managed configurations also use one connection", async () => {
  assert.equal((await loadConfig({ MYSQL_ADDON_HOST: "remote.example.test", MYSQL_ADDON_DB: "qa", DB_CONNECTION_LIMIT: "10" }, "addon")).connectionLimit, 1);
  assert.equal((await loadConfig({ DB_HOST: "localhost", DB_MANAGED: "true", DB_CONNECTION_LIMIT: "10" }, "explicit")).connectionLimit, 1);
});
test("local development can keep its configured pool size", async () => {
  const db = await loadConfig({ DB_HOST: "localhost", DB_CONNECTION_LIMIT: "4" }, "local");
  assert.equal(db.managed, false);
  assert.equal(db.connectionLimit, 4);
});

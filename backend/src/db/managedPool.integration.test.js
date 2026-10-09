import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import mysql from "mysql2";
import { createManagedPool } from "./managedPool.js";

test("mysql2 reuses a busy connection for queued queries, then closes it after idle or transaction release", { timeout: 10_000 }, async () => {
  // A loopback protocol server exercises real sockets without touching a database.
  const server = mysql.createServer();
  const serverConnections = [];
  const clientConnections = [];
  const errors = [];
  server.on("connection", (connection) => {
    serverConnections.push(connection);
    connection.on("error", (error) => {
      if (error.code !== "PROTOCOL_CONNECTION_LOST" && error.code !== "ECONNRESET") errors.push(error);
    });
    connection.serverHandshake({
      protocolVersion: 10, serverVersion: "test", connectionId: serverConnections.length, statusFlags: 2, characterSet: 8, capabilityFlags: 0xffffff,
      authCallback: (_params, done) => { done(null); connection.sequenceId = 0; },
    });
    connection.on("packet", () => { connection.sequenceId = 0; });
    connection.on("query", (sql) => {
      connection.sequenceId = 1;
      if (sql === "SELECT 1") {
        connection.writeColumns([{ catalog: "def", schema: "", table: "", orgTable: "", name: "ok", orgName: "", characterSet: 63, columnLength: 1, columnType: 3, flags: 0, decimals: 0 }]);
        connection.writeTextRow(["1"]);
        connection.writeEof();
      } else {
        connection.writeOk();
      }
    });
  });
  await new Promise((resolve, reject) => {
    server._server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const rawPool = mysql.createPool({ host: "127.0.0.1", port: server._server.address().port, user: "test", connectionLimit: 1, maxIdle: 0 }).promise();
  rawPool.on("connection", (connection) => { clientConnections.push(connection); });
  const pool = createManagedPool(rawPool);
  try {
    const results = await Promise.all(Array.from({ length: 14 }, () => pool.query("SELECT 1")));
    assert.equal(clientConnections.length, 1);
    for (const [rows] of results) assert.deepEqual(rows, [{ ok: 1 }]);
    assert.equal(clientConnections[0].stream.writableEnded, true);

    await pool.query("SELECT 1");
    assert.equal(clientConnections.length, 2);
    assert.equal(clientConnections[1].stream.writableEnded, true);

    const connection = await pool.getConnection();
    await connection.beginTransaction();
    await connection.query("SELECT 1");
    await connection.commit();
    assert.equal(clientConnections.length, 3);
    assert.equal(clientConnections[2].stream.destroyed, false);
    const closed = once(clientConnections[2].stream, "close");
    connection.release();
    assert.equal(clientConnections[2].stream.writableEnded, true);
    await closed;
    assert.deepEqual(errors, []);
  } finally {
    for (const connection of clientConnections) connection.destroy();
    await pool.end();
    for (const connection of serverConnections) connection.stream.destroy();
    await new Promise((resolve) => { server.close(resolve); });
  }
});

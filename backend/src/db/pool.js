import mysql from "mysql2/promise";
import { config } from "../config/env.js";
import { escapeIdentifier } from "../utils/mysql.js";

let pool;

export async function initializePool() {
  if (pool) {
    await pool.end().catch(() => undefined);
    pool = undefined;
  }

  if (!config.db.managed) {
    const bootstrapPool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      waitForConnections: true,
      connectionLimit: config.db.connectionLimit,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      multipleStatements: false,
    });

    try {
      await bootstrapPool.query(
        `CREATE DATABASE IF NOT EXISTS ${escapeIdentifier(config.db.name)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
    } finally {
      await bootstrapPool.end().catch(() => undefined);
    }
  }

  pool = mysql.createPool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
    waitForConnections: true,
    connectionLimit: config.db.connectionLimit,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    namedPlaceholders: true,
  });

  return pool;
}

export function getPool() {
  if (!pool) {
    throw new Error("Database pool belum diinisialisasi.");
  }

  return pool;
}

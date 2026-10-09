import mysql from "mysql2/promise";
import { config } from "../config/env.js";
import { escapeIdentifier } from "../utils/mysql.js";
import { createManagedPool } from "./managedPool.js";

let pool;
let initialization;

export async function initializePool() {
  if (pool) return pool;
  if (!initialization) initialization = createPool().finally(() => { initialization = undefined; });
  return initialization;
}

async function createPool() {
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

  const rawPool = mysql.createPool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
    waitForConnections: true,
    connectionLimit: config.db.connectionLimit,
    maxIdle: config.db.managed ? 0 : config.db.connectionLimit,
    idleTimeout: 10_000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    namedPlaceholders: true,
  });
  pool = config.db.managed ? createManagedPool(rawPool) : rawPool;

  return pool;
}

export function getPool() {
  if (!pool) {
    throw new Error("Database pool belum diinisialisasi.");
  }

  return pool;
}

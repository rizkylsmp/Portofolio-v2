import crypto from "node:crypto";
import { config } from "../config/env.js";
import { getPool } from "../db/pool.js";

export function isCredentialConfigured() {
  return config.adminPassword.length > 0 && /^\d{6}$/.test(config.adminPin);
}
export function validateCredentials(password, pin) {
  return safeCompare(String(password || ""), config.adminPassword) && safeCompare(String(pin || ""), config.adminPin);
}
export function hashAuthKey(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
export async function getLockout(clientKey) {
  const now = Date.now();
  const pool = getPool();
  const key = hashAuthKey(clientKey);
  await pool.query("DELETE FROM admin_login_attempts WHERE locked_until <= ? AND updated_at <= ?", [now, now - config.auth.lockoutDurationMs]);
  const [[record]] = await pool.query("SELECT attempts, locked_until FROM admin_login_attempts WHERE client_key = ?", [key]);
  const remainingMs = Math.max(0, Number(record?.locked_until || 0) - now);
  return { locked: remainingMs > 0, remainingMs, attemptsLeft: Math.max(0, config.auth.maxAttempts - Number(record?.attempts || 0)) };
}
export async function recordFailedLogin(clientKey) {
  const now = Date.now();
  await getPool().query(`INSERT INTO admin_login_attempts (client_key, attempts, locked_until, updated_at)
    VALUES (?, 1, 0, ?) ON DUPLICATE KEY UPDATE
    attempts = IF(updated_at <= ? AND locked_until <= ?, 1, attempts + 1),
    locked_until = IF(attempts >= ?, ?, locked_until), updated_at = ?`,
  [hashAuthKey(clientKey), now, now - config.auth.lockoutDurationMs, now, config.auth.maxAttempts, now + config.auth.lockoutDurationMs, now]);
  const lockout = await getLockout(clientKey);
  return { locked: lockout.locked, retryAfterMs: lockout.remainingMs, attemptsLeft: lockout.attemptsLeft };
}
export async function clearFailedLogin(clientKey) {
  await getPool().query("DELETE FROM admin_login_attempts WHERE client_key = ?", [hashAuthKey(clientKey)]);
}
export async function createSession() {
  const token = crypto.randomBytes(32).toString("base64url");
  const pool = getPool();
  await pool.query("DELETE FROM admin_sessions WHERE expires_at <= ?", [Date.now()]);
  await pool.query("INSERT INTO admin_sessions (token_hash, expires_at) VALUES (?, ?)", [hashAuthKey(token), Date.now() + config.auth.sessionTtlMs]);
  return token;
}
export async function deleteSession(token) {
  if (token) await getPool().query("DELETE FROM admin_sessions WHERE token_hash = ?", [hashAuthKey(token)]);
}
export async function refreshSession(token) {
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token)) return false;
  const [result] = await getPool().query("UPDATE admin_sessions SET expires_at = ? WHERE token_hash = ? AND expires_at > ?", [Date.now() + config.auth.sessionTtlMs, hashAuthKey(token), Date.now()]);
  return result.affectedRows > 0;
}
function safeCompare(input, expected) {
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

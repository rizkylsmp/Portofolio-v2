import crypto from "node:crypto";
import { config } from "../config/env.js";

const sessions = new Map();
const lockouts = new Map();

export function isCredentialConfigured() {
  return config.adminPassword.length > 0 && /^\d{6}$/.test(config.adminPin);
}

export function validateCredentials(password, pin) {
  return (
    safeCompare(String(password || ""), config.adminPassword) &&
    safeCompare(String(pin || ""), config.adminPin)
  );
}

export function getLockout(clientKey) {
  const record = lockouts.get(clientKey);
  if (!record) {
    return { locked: false, remainingMs: 0, attemptsLeft: config.auth.maxAttempts };
  }

  if (record.lockedUntil && record.lockedUntil > Date.now()) {
    return {
      locked: true,
      remainingMs: record.lockedUntil - Date.now(),
      attemptsLeft: 0,
    };
  }

  if (record.lockedUntil) lockouts.delete(clientKey);
  const attempts = lockouts.get(clientKey)?.attempts || 0;
  return {
    locked: false,
    remainingMs: 0,
    attemptsLeft: config.auth.maxAttempts - attempts,
  };
}

export function recordFailedLogin(clientKey) {
  const current = lockouts.get(clientKey) || { attempts: 0, lockedUntil: 0 };
  const attempts = current.attempts + 1;

  if (attempts >= config.auth.maxAttempts) {
    lockouts.set(clientKey, {
      attempts,
      lockedUntil: Date.now() + config.auth.lockoutDurationMs,
    });
    return {
      locked: true,
      retryAfterMs: config.auth.lockoutDurationMs,
      attemptsLeft: 0,
    };
  }

  lockouts.set(clientKey, { attempts, lockedUntil: 0 });
  return {
    locked: false,
    retryAfterMs: 0,
    attemptsLeft: config.auth.maxAttempts - attempts,
  };
}

export function clearFailedLogin(clientKey) {
  lockouts.delete(clientKey);
}

export function createSession() {
  const token = crypto.randomBytes(32).toString("base64url");
  sessions.set(token, Date.now() + config.auth.sessionTtlMs);
  return token;
}

export function deleteSession(token) {
  if (token) sessions.delete(token);
}

export function refreshSession(token) {
  const expiresAt = token ? sessions.get(token) : 0;
  if (!token || !expiresAt) return false;

  if (expiresAt <= Date.now()) {
    sessions.delete(token);
    return false;
  }

  sessions.set(token, Date.now() + config.auth.sessionTtlMs);
  return true;
}

function safeCompare(input, expected) {
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

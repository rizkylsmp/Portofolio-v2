import { Router } from "express";
import { config } from "../config/env.js";
import {
  clearFailedLogin,
  createSession,
  deleteSession,
  getLockout,
  isCredentialConfigured,
  recordFailedLogin,
  validateCredentials,
} from "../services/authService.js";
import { getClientKey, readBearer } from "../utils/http.js";

export const authRoutes = Router();

authRoutes.post("/login", (req, res) => {
  if (!isCredentialConfigured()) {
    res.status(503).json({ error: "ADMIN_PASSWORD dan ADMIN_PIN 6 digit belum dikonfigurasi di backend." });
    return;
  }

  const clientKey = getClientKey(req);
  const lockout = getLockout(clientKey);

  if (lockout.locked) {
    res.status(429).json({
      error: "Terlalu banyak percobaan gagal. Akun terkunci sementara.",
      retryAfterMs: lockout.remainingMs,
      attemptsLeft: 0,
    });
    return;
  }

  if (!validateCredentials(req.body?.password, req.body?.pin)) {
    const failed = recordFailedLogin(clientKey);
    res.status(failed.locked ? 429 : 401).json({
      error: failed.locked
        ? "Terlalu banyak percobaan gagal. Akun terkunci selama 5 menit."
        : "Password atau PIN salah.",
      retryAfterMs: failed.retryAfterMs,
      attemptsLeft: failed.attemptsLeft,
    });
    return;
  }

  clearFailedLogin(clientKey);
  res.json({ token: createSession(), expiresInMs: config.auth.sessionTtlMs });
});

authRoutes.post("/logout", (req, res) => {
  deleteSession(readBearer(req));
  res.json({ success: true });
});

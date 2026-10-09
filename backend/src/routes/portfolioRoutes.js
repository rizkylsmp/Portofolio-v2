import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import {
  patchPortfolioData,
  readPortfolioData,
  portfolioVersions,
} from "../services/portfolioService.js";
import { validatePortfolio } from "../validation/portfolio.js";
import { listPortfolioBackups, readPortfolioBackup } from "../services/backupService.js";
import { isConnectionCapacityError } from "../db/managedPool.js";

export const portfolioRoutes = Router();

portfolioRoutes.get("/portfolio", async (_req, res, next) => {
  try {
    const data = await readPortfolioData();
    res.json({ ...data, _versions: portfolioVersions(data) });
  } catch (err) {
    if (isConnectionCapacityError(err)) return next(err);
    res.status(500).json({
      error: "Gagal membaca data portfolio.",
      details: String(err.message || err),
    });
  }
});

portfolioRoutes.put("/admin/portfolio", requireAdmin, async (req, res, next) => {
  try {
    const data = validatePortfolio(req.body);
    const result = await patchPortfolioData({ ...data, _versions: req.body._versions, _replaceConfirmed: req.body._replaceConfirmed });
    res.json({ ...result, success: true, message: "Data portfolio berhasil disimpan." });
  } catch (err) {
    if (isConnectionCapacityError(err)) return next(err);
    res.status(err.status || 500).json({
      error: "Gagal menyimpan data portfolio.",
      details: String(err.message || err),
    });
  }
});

portfolioRoutes.get("/admin/backups", requireAdmin, async (_req, res) => {
  res.json({ backups: await listPortfolioBackups() });
});

portfolioRoutes.get("/admin/backups/:id", requireAdmin, async (req, res) => {
  res.json(await readPortfolioBackup(req.params.id));
});

portfolioRoutes.post("/admin/backups/:id/restore", requireAdmin, async (req, res) => {
  if (req.body?.confirmed !== true) return res.status(400).json({ error: "Konfirmasi pemulihan backup diperlukan." });
  const data = await readPortfolioBackup(req.params.id);
  const result = await patchPortfolioData({ ...data, _versions: req.body._versions, _replaceConfirmed: true });
  res.json({ ...result, success: true });
});

portfolioRoutes.patch("/admin/portfolio", requireAdmin, async (req, res, next) => {
  try {
    const result = await patchPortfolioData(req.body);
    res.json({ ...result, success: true, message: "Perubahan portfolio berhasil disimpan." });
  } catch (err) {
    if (isConnectionCapacityError(err)) return next(err);
    res.status(err.status || 500).json({
      error: "Gagal menyimpan perubahan portfolio.",
      details: String(err.message || err),
    });
  }
});

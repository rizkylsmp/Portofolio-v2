import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import {
  patchPortfolioData,
  readPortfolioData,
  writePortfolioData,
} from "../services/portfolioService.js";

export const portfolioRoutes = Router();

portfolioRoutes.get("/portfolio", async (_req, res) => {
  try {
    res.json(await readPortfolioData());
  } catch (err) {
    res.status(500).json({
      error: "Gagal membaca data portfolio.",
      details: String(err.message || err),
    });
  }
});

portfolioRoutes.put("/admin/portfolio", requireAdmin, async (req, res) => {
  try {
    await writePortfolioData(req.body);
    res.json({ success: true, message: "Data portfolio berhasil disimpan." });
  } catch (err) {
    res.status(400).json({
      error: "Gagal menyimpan data portfolio.",
      details: String(err.message || err),
    });
  }
});

portfolioRoutes.patch("/admin/portfolio", requireAdmin, async (req, res) => {
  try {
    await patchPortfolioData(req.body);
    res.json({ success: true, message: "Perubahan portfolio berhasil disimpan." });
  } catch (err) {
    res.status(400).json({
      error: "Gagal menyimpan perubahan portfolio.",
      details: String(err.message || err),
    });
  }
});

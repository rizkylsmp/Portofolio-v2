import { Router } from "express";
import { readPlaygroundProjects } from "../services/playgroundService.js";

export const playgroundRoutes = Router();

playgroundRoutes.get("/", async (_req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    res.json({ projects: await readPlaygroundProjects() });
  } catch (error) {
    console.warn("[playground] Cannot read Naki Code projects:", error.message);
    res.status(503).json({ error: "Proyek belum bisa dimuat. Silakan coba lagi." });
  }
});

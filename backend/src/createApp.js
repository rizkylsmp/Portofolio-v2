import path from "node:path";
import express from "express";
import { config } from "./config/env.js";
import { corsMiddleware } from "./middleware/cors.js";
import { errorHandler, notFoundApiHandler } from "./middleware/errorHandler.js";
import { authRoutes } from "./routes/authRoutes.js";
import { portfolioRoutes } from "./routes/portfolioRoutes.js";
import { uploadRoutes } from "./routes/uploadRoutes.js";

export function createApp({ beforeRoutes } = {}) {
  const app = express();

  app.set("trust proxy", true);
  app.use(corsMiddleware);
  app.use(express.json({ limit: "2mb" }));
  if (beforeRoutes) app.use(beforeRoutes);

  app.use("/api/auth", authRoutes);
  app.use("/api", uploadRoutes);
  app.use("/api", portfolioRoutes);
  app.use("/api", notFoundApiHandler);

  app.use("/uploads", express.static(config.uploadDir));
  app.use(express.static(config.distDir));
  app.use((_req, res) => {
    res.sendFile(path.join(config.distDir, "index.html"), (err) => {
      if (err) {
        res.status(404).type("text").send("Build belum tersedia. Jalankan `npm run build` terlebih dahulu.");
      }
    });
  });

  app.use(errorHandler);

  return app;
}

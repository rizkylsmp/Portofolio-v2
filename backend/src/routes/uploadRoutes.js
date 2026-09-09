import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Router } from "express";
import multer from "multer";
import { config } from "../config/env.js";
import { requireAdmin } from "../middleware/auth.js";

const allowedTargets = new Set(["projects", "experiences", "certificates"]);

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const target = req.params.target;
    if (!allowedTargets.has(target)) {
      cb(new Error("Target upload tidak valid."));
      return;
    }

    const targetDir = path.join(config.uploadDir, target);
    fs.mkdirSync(targetDir, { recursive: true });
    cb(null, targetDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${Date.now()}-${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 10,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("File harus berupa gambar."));
      return;
    }

    cb(null, true);
  },
});

export const uploadRoutes = Router();

uploadRoutes.post(
  "/admin/uploads/:target",
  requireAdmin,
  upload.array("images", 10),
  (req, res) => {
    const target = req.params.target;
    if (!allowedTargets.has(target)) {
      res.status(400).json({ error: "Target upload tidak valid." });
      return;
    }

    const files = Array.isArray(req.files) ? req.files : [];
    res.json({
      urls: files.map((file) => `/uploads/${target}/${file.filename}`),
    });
  }
);

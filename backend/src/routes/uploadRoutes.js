import { Router } from "express";
import multer from "multer";
import { requireAdmin } from "../middleware/auth.js";
import { uploadImageBuffer } from "../services/cloudinaryService.js";

const allowedTargets = new Set(["projects", "experiences", "certificates"]);

const upload = multer({
  storage: multer.memoryStorage(),
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
  async (req, res, next) => {
    const target = req.params.target;
    if (!allowedTargets.has(target)) {
      res.status(400).json({ error: "Target upload tidak valid." });
      return;
    }

    try {
      const files = Array.isArray(req.files) ? req.files : [];
      const assets = await Promise.all(
        files.map((file) => uploadImageBuffer(file.buffer, target))
      );

      res.json({
        urls: assets.map((asset) => asset.url),
        assets,
      });
    } catch (error) {
      next(error);
    }
  }
);

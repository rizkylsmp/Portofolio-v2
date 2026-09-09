import { refreshSession } from "../services/authService.js";
import { readBearer } from "../utils/http.js";

export function requireAdmin(req, res, next) {
  const token = readBearer(req);

  if (!refreshSession(token)) {
    res.status(401).json({ error: "Sesi admin tidak valid atau sudah berakhir." });
    return;
  }

  next();
}

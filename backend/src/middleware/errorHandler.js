export function notFoundApiHandler(_req, res) {
  res.status(404).json({ error: "API route tidak ditemukan." });
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof SyntaxError) {
    res.status(400).json({ error: "Payload JSON tidak valid." });
    return;
  }

  if (
    err?.name === "MulterError" ||
    err?.message === "File harus berupa gambar." ||
    err?.message === "Target upload tidak valid."
  ) {
    res.status(400).json({ error: err.message || "Upload gambar tidak valid." });
    return;
  }

  console.error("[portfolio-backend] Unhandled error:", err);
  res.status(500).json({ error: "Terjadi kesalahan server." });
}

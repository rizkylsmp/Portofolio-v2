import { getPool } from "../db/pool.js";
import { validatePortfolio } from "../validation/portfolio.js";

export async function listPortfolioBackups() {
  const [rows] = await getPool().query("SELECT id, created_at FROM portfolio_backups ORDER BY id DESC LIMIT 30");
  return rows;
}

export async function readPortfolioBackup(id) {
  if (!/^[1-9]\d{0,19}$/.test(String(id))) throw Object.assign(new Error("ID backup tidak valid."), { status: 400 });
  const [[row]] = await getPool().query("SELECT data FROM portfolio_backups WHERE id = ?", [String(id)]);
  if (!row) throw Object.assign(new Error("Backup tidak ditemukan."), { status: 404 });
  return validatePortfolio(typeof row.data === "string" ? JSON.parse(row.data) : row.data);
}

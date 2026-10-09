import { useCallback, useEffect, useState } from "react";
import { MdFileDownload, MdRestore, MdRefresh } from "react-icons/md";
import { apiClient, getApiErrorMessage } from "../services/apiClient";
import { getSessionToken } from "../services/authService";
import { importAllData } from "../services/storageService";
import { AdminForm } from "./AdminForm";

interface Backup { id: number; created_at: string }
const headers = () => ({ Authorization: `Bearer ${getSessionToken()}` });
export function AdminBackups({ onSaved }: { onSaved: () => void }) {
  const [rows, setRows] = useState<Backup[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<{ id: number; data: string } | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const { data } = await apiClient.get("/api/admin/backups", { headers: headers() }); setRows(data.backups); }
    catch (err) { setError(getApiErrorMessage(err, "Gagal membaca backup.")); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const select = async (id: number, download: boolean) => {
    setLoading(true); setError("");
    try {
      const { data } = await apiClient.get(`/api/admin/backups/${id}`, { headers: headers() });
      const text = JSON.stringify(data, null, 2);
      if (!download) { setSelected({ id, data: text }); return; }
      const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = `portfolio-backup-${id}.json`; anchor.click(); URL.revokeObjectURL(url);
    } catch (err) { setError(getApiErrorMessage(err, "Gagal membaca backup.")); }
    finally { setLoading(false); }
  };
  return <div className="p-6 space-y-4">
    <h2 className="text-xl font-bold">Backup Portofolio</h2>
    {error && <p role="alert" className="text-red-500">{error}</p>}
    {loading && <p role="status">Memuat...</p>}
    {selected ? <AdminForm draft={selected.id} onSubmit={async () => {
      try { await importAllData(selected.data); onSaved(); return true; }
      catch (err) { setError(err instanceof Error ? err.message : "Gagal memulihkan backup."); return false; }
    }}>
      <p className="mb-4">Pulihkan backup #{selected.id}? Semua bagian akan diganti. Data saat ini akan disimpan sebagai backup baru.</p>
      <dl className="mb-4">{Object.entries(JSON.parse(selected.data)).map(([key, value]) => <div key={key} className="flex justify-between"><dt>{key}</dt><dd>{Array.isArray(value) ? value.length : value ? 1 : 0}</dd></div>)}</dl>
      <div className="flex justify-end gap-4"><button type="button" onClick={() => setSelected(null)}>Batal</button><button type="submit" className="flex items-center gap-2 px-4 py-2 bg-accent text-surface rounded-lg"><MdRestore /> Pulihkan</button></div>
    </AdminForm> : <>
      <button type="button" aria-label="Muat ulang backup" title="Muat ulang backup" disabled={loading} onClick={() => { void load(); }}><MdRefresh size={24} /></button>
      {!loading && rows.length === 0 && <p>Belum ada backup.</p>}
      {rows.map((row) => <div key={row.id} className="flex items-center justify-between gap-2 border-b border-border py-3">
        <span className="text-sm">#{row.id} · {new Date(row.created_at).toLocaleString("id-ID")}</span>
        <div className="flex gap-3">
          <button disabled={loading} aria-label={`Unduh backup ${row.id}`} title="Unduh" onClick={() => { void select(row.id, true); }}><MdFileDownload size={22} /></button>
          <button disabled={loading} aria-label={`Pulihkan backup ${row.id}`} title="Pulihkan" onClick={() => { void select(row.id, false); }}><MdRestore size={22} /></button>
        </div>
      </div>)}
    </>}
  </div>;
}

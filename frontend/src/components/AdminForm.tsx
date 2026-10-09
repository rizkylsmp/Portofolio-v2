import { useEffect, useRef, useState } from "react";
import { MdFileDownload } from "react-icons/md";

export function AdminForm({ draft, onSubmit, children, className, contentClassName = "" }: {
  draft?: unknown;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<boolean | void>;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const value = JSON.stringify(draft);
  const baseline = useRef(value);
  const form = useRef<HTMLFormElement>(null);
  const saving = useRef(false);
  const uploads = useRef(0);
  const [busy, setBusy] = useState(false);
  const dirty = value !== baseline.current;
  useEffect(() => {
    const element = form.current!;
    const update = (event: Event) => {
      uploads.current = Math.max(0, uploads.current + (event as CustomEvent<number>).detail);
      element.dataset.adminBusy = String(uploads.current > 0 || saving.current);
      setBusy(uploads.current > 0 || saving.current);
    };
    const leave = (event: BeforeUnloadEvent) => {
      if (element.dataset.adminDirty === "true" || element.dataset.adminBusy === "true") {
        event.preventDefault(); event.returnValue = "";
      }
    };
    element.addEventListener("admin-upload", update);
    window.addEventListener("beforeunload", leave);
    return () => {
      element.removeEventListener("admin-upload", update);
      window.removeEventListener("beforeunload", leave);
    };
  }, []);
  return <form ref={form} className={className} data-admin-dirty={dirty} data-admin-busy={busy} aria-busy={busy}
    onSubmit={async (event) => {
      event.preventDefault();
      if (saving.current || uploads.current) return;
      saving.current = true; form.current!.dataset.adminBusy = "true"; setBusy(true);
      try {
        if (await onSubmit(event) !== false) baseline.current = value;
      } finally {
        saving.current = false;
        if (form.current) form.current.dataset.adminBusy = String(uploads.current > 0);
        setBusy(uploads.current > 0);
      }
    }}>
    <fieldset disabled={busy} className={`min-w-0 border-0 p-0 m-0 disabled:opacity-70 ${contentClassName}`}>{children}</fieldset>
    {dirty && draft !== undefined && <button type="button" title="Unduh draft belum tersimpan" aria-label="Unduh draft belum tersimpan" className="mx-4 my-2 p-2" onClick={() => {
      const url = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" }));
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = "portfolio-form-draft.json"; anchor.click(); URL.revokeObjectURL(url);
    }}><MdFileDownload size={20} /></button>}
    {busy && <p role="status" className="px-4 py-2 text-sm text-text-secondary">Memproses...</p>}
  </form>;
}

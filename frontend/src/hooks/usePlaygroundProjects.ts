import { useEffect, useState } from "react";
import { fetchNakiProjects, fetchNakiDesigns, type PlaygroundProject } from "../services/nakiProjects";
import { getProjects } from "../services/storageService";

export type { PlaygroundProject } from "../services/nakiProjects";

export function usePlaygroundProjects() {
  const [projects, setProjects] = useState<PlaygroundProject[]>([]);
  const [designs, setDesigns] = useState<PlaygroundProject[]>([]);
  const [company] = useState<PlaygroundProject[]>(() => getProjects().map((item) => ({
    ...item, id: `company-${item.id}`, kind: "company", niche: "", techStack: item.techIcons,
  })));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [request, setRequest] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let fetching = false;
    let lastFetched = 0;
    let failures = 0;
    let retryTimer: number | undefined;

    const refresh = async () => {
      if (fetching || controller.signal.aborted) return;
      window.clearTimeout(retryTimer);
      let retryNeeded = false;
      fetching = true;
      lastFetched = Date.now();
      setLoading(true);
      try {
        const options = { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]) };
        const results = await Promise.allSettled([fetchNakiProjects(options), fetchNakiDesigns(options)]);
        if (!controller.signal.aborted) {
          if (results[0].status === "fulfilled") setProjects(results[0].value);
          if (results[1].status === "fulfilled") setDesigns(results[1].value);
          const failed = results.flatMap((result, index) => result.status === "rejected" ? [index === 0 ? "Portofolio" : "Design"] : []);
          retryNeeded = failed.length > 0;
          setError(retryNeeded ? `${failed.join(" dan ")} Naki Code belum bisa dimuat. Mencoba lagi otomatis...` : "");
        }
      } catch {
        if (!controller.signal.aborted) {
          retryNeeded = true;
          setError("Karya belum bisa dimuat. Mencoba lagi otomatis...");
        }
      } finally {
        fetching = false;
        if (!controller.signal.aborted) {
          setLoading(false);
          if (retryNeeded) {
            const delay = Math.min(2000 * 2 ** Math.min(failures, 4), 30000);
            failures += 1;
            retryTimer = window.setTimeout(() => { void refresh(); }, delay);
          } else failures = 0;
        }
      }
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastFetched >= 60000) {
        void refresh();
      }
    };

    void refresh();
    const interval = window.setInterval(refreshWhenVisible, 60000);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", refreshWhenVisible);
    return () => {
      controller.abort();
      window.clearTimeout(retryTimer);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, [request]);

  return { projects: [...company, ...projects, ...designs], loading, error, retry: () => setRequest((current) => current + 1) };
}

import { useEffect, useState } from "react";
import { apiClient, getApiErrorMessage } from "../services/apiClient";

export interface PlaygroundProject {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  link: string;
}

export function usePlaygroundProjects() {
  const [projects, setProjects] = useState<PlaygroundProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [request, setRequest] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let fetching = false;
    let lastFetched = 0;

    const refresh = async () => {
      if (fetching || controller.signal.aborted) return;
      fetching = true;
      lastFetched = Date.now();
      setLoading(true);
      try {
        const { data } = await apiClient.get<{ projects: PlaygroundProject[] }>("/api/playground", {
          signal: controller.signal,
          timeout: 20000,
        });
        if (!Array.isArray(data.projects)) throw new Error("Invalid playground response.");
        if (!controller.signal.aborted) {
          setProjects(data.projects);
          setError("");
        }
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(getApiErrorMessage(cause, "Proyek belum bisa dimuat. Silakan coba lagi."));
        }
      } finally {
        fetching = false;
        if (!controller.signal.aborted) setLoading(false);
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
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, [request]);

  return { projects, loading, error, retry: () => setRequest((current) => current + 1) };
}

// ==========================================
// Hook to initialize portfolio data
// ==========================================

import { useState, useEffect } from "react";
import { initializePortfolioData } from "../services/storageService";

export function useInitializeData() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    initializePortfolioData()
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Gagal mengambil data portfolio."));
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { ready, error };
}

// ==========================================
// Hook to confirm data is ready
// ==========================================
// Data is now auto-initialized from portfolioData.json
// via the storageService import. This hook simply
// signals that the app can render.
// ==========================================

import { useState, useEffect } from "react";

export function useInitializeData() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // storageService already initializes the in-memory store
    // from portfolioData.json on import — nothing else to do.
    setReady(true);
  }, []);

  return ready;
}

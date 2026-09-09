// import Theme from "./components/Theme";
// import Navbar from "./components/Navbar";
// import Music from "./components/Music";
// import Profile from "./pages/Profile";
// import Skills from "./pages/Skills";
// import Projects from "./pages/Projects";
// import Contact from "./pages/Contact";
// import Certificate from "./pages/Certificate";
// import Experience from "./pages/Experience";
import { RouterProvider } from "react-router-dom";
import router from "./router/RouterApp";
import React from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { useInitializeData } from "./hooks/useInitializeData";
import { PiDatabaseBold } from "react-icons/pi";

function App() {
  const { ready: dataReady, error: dataError } = useInitializeData();

  React.useEffect(() => {
    try {
      AOS.init({
        duration: 1000,
        once: true,
        easing: "ease-out-cubic",
        offset: 100,
        delay: 0,
      });
    } catch (error) {
      console.warn("AOS initialization failed:", error);
    }
  }, []);

  if (!dataReady) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6 text-text-primary">
        <div className="max-w-md rounded-2xl border border-border bg-surface-secondary p-8 text-center shadow-xl">
          <PiDatabaseBold className="mx-auto mb-4 text-5xl text-accent" />
          <h1 className="mb-3 text-2xl font-bold text-accent">Database tidak terhubung</h1>
          <p className="mb-6 text-text-secondary">
            Portfolio sekarang memakai mode DB-only. Pastikan backend Express dan MySQL sedang berjalan.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-accent px-5 py-2.5 font-semibold text-surface transition-colors hover:bg-accent-hover"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;

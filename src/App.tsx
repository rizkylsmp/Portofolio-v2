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

function App() {
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

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;

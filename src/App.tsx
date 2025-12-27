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

function App() {
  React.useEffect(() => {
    AOS.init();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App

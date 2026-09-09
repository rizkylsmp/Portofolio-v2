import { useState, useEffect } from "react";

// ICONS
import { CiLight, CiDark } from "react-icons/ci";

const Theme = () => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check if theme preference exists in localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    // Default to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    // Apply theme on component mount and when darkMode changes
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Save preference to localStorage
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="fixed right-5 bottom-5 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-accent text-surface shadow-lg hover:bg-accent-hover hover:scale-110 transition-all duration-300 cursor-pointer"
      aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {darkMode ? <CiDark size={20} /> : <CiLight size={20} />}
    </button>
  );
};

export default Theme;

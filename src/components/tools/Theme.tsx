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
    <div>
      <button
        onClick={toggleDarkMode}
        className="flex gap-2 items-center px-3 py-3 rounded-full bg-accent-hover text-surface fixed right-10 bottom-10 z-50 duration-300 outline-none"
      >
        <div>{darkMode ? <CiDark size={20} /> : <CiLight size={20} />}</div>
        <div className="md:block hidden">
          {darkMode ? "Dark Mode" : "Light Mode"}
        </div>
      </button>
    </div>
  );
};

export default Theme;

import { useState, useEffect, useRef } from "react";
import { animate } from "animejs";

// ICONS
import { CiLight, CiDark } from "react-icons/ci";

const Theme = () => {
  const iconRef = useRef<HTMLSpanElement>(null);
  const iconAnimation = useRef<ReturnType<typeof animate> | null>(null);
  const cleanupTimer = useRef<ReturnType<typeof window.setTimeout> | null>(null);
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
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.classList.add("theme-changing");
      if (cleanupTimer.current) window.clearTimeout(cleanupTimer.current);
      cleanupTimer.current = window.setTimeout(() => document.documentElement.classList.remove("theme-changing"), 500);
      iconAnimation.current?.revert();
      if (iconRef.current) iconAnimation.current = animate(iconRef.current, {
        rotate: [0, 180], scale: [0.8, 1], duration: 400, ease: "out(3)",
      });
    }
    setDarkMode((current) => !current);
  };

  useEffect(() => () => {
    iconAnimation.current?.revert();
    if (cleanupTimer.current) window.clearTimeout(cleanupTimer.current);
    document.documentElement.classList.remove("theme-changing");
  }, []);

  return (
    <button
      onClick={toggleDarkMode}
      className="fixed right-5 bottom-5 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-accent text-surface shadow-lg hover:bg-accent-hover hover:scale-110 transition-all duration-300 cursor-pointer"
      aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <span ref={iconRef} className="block">{darkMode ? <CiDark size={20} /> : <CiLight size={20} />}</span>
    </button>
  );
};

export default Theme;

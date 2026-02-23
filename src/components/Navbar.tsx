import React from "react";
import { HiMoon } from "react-icons/hi";
import { RxHamburgerMenu, RxCross2 } from "react-icons/rx";
import { MdAdminPanelSettings } from "react-icons/md";

const Navbar = () => {
  const Links = [
    { name: "Profile", to: "#profile" },
    { name: "Skills", to: "#skills" },
    { name: "Experience", to: "#experience" },
    { name: "Projects", to: "#projects" },
    { name: "Certificate", to: "#certificates" },
    { name: "Contact", to: "#contact" },
  ];

  const [open, setOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("profile");
  const [isScrolled, setIsScrolled] = React.useState(false);

  // Track scroll position for navbar styling
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track active section based on scroll position
  React.useEffect(() => {
    const handleScroll = () => {
      const sections = Links.map((link) => link.to.replace("#", ""));
      const currentSection = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 150 && rect.bottom > 150;
        }
        return false;
      });

      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigate = (to: string) => {
    setOpen(false);
    const sectionId = to.replace("#", "");
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="fixed z-50 w-full p-5">
      <nav
        className={`flex justify-between px-6 py-3 items-center top-0 left-0 right-0 rounded-2xl transition-all duration-300 ${
          isScrolled ? "bg-accent/95 backdrop-blur-md shadow-xl" : "bg-accent"
        }`}
      >
        {/* LOGO */}
        <div>
          <a
            href="/"
            className="flex gap-2 font-bold text-xl items-center text-surface transition-transform duration-300 hover:scale-105"
            onClick={(e) => {
              e.preventDefault();
              handleNavigate("#profile");
            }}
          >
            <HiMoon className="animate-pulse" />
            RLSMP
          </a>
        </div>

        <div
          onClick={() => setOpen(!open)}
          className="text-2xl cursor-pointer md:hidden text-surface transition-transform duration-300 hover:scale-110"
        >
          {open ? <RxCross2 /> : <RxHamburgerMenu />}
        </div>

        {/* MENU */}
        <div
          className={`md:flex-row md:gap-6 md:bg-transparent md:static md:translate-x-0 md:py-0 md:opacity-100 md:translate-y-0 transform rounded-2xl absolute flex flex-col gap-10 top-20 py-10 mx-5 items-center right-0 left-0 transition-all duration-500 ease-in-out text-surface ${
            isScrolled ? "bg-accent/95 backdrop-blur-md" : "bg-accent"
          } ${
            open
              ? "opacity-100 translate-y-0"
              : "translate-y-[-200vh] opacity-0"
          }`}
        >
          {Links.map((link, index) => {
            const sectionId = link.to.replace("#", "");
            const isActive = activeSection === sectionId;

            return (
              <button
                key={index}
                className={`relative px-4 py-2 rounded-lg transition-all duration-300 border-none cursor-pointer font-medium ${
                  isActive
                    ? "bg-surface/20 text-surface shadow-lg"
                    : "hover:bg-surface/10 hover:text-surface"
                }`}
                onClick={() => handleNavigate(link.to)}
              >
                {link.name}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-surface rounded-full animate-pulse" />
                )}
              </button>
            );
          })}

          {/* Admin button — only visible in dev (localhost) */}
          {import.meta.env.DEV && (
            <a
              href="/#/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface/15 hover:bg-surface/25 text-surface/70 hover:text-surface transition-all duration-300 border border-surface/20 hover:border-surface/40"
              title="Admin Panel (dev only)"
            >
              <MdAdminPanelSettings className="text-sm" />
              Admin
            </a>
          )}

        </div>
      </nav>
    </div>
  );
};

export default Navbar;

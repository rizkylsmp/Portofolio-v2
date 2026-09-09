import React from "react";
import { RxCross2, RxHamburgerMenu } from "react-icons/rx";

const LINKS = [
  { name: "Profile", to: "#profile" },
  { name: "Skills", to: "#skills" },
  { name: "Experience", to: "#experience" },
  { name: "Playground", to: "#projects" },
  { name: "Certificate", to: "#certificates" },
  { name: "Let's Talk", to: "#contact" },
] as const;

const Navbar = () => {
  const [open, setOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("profile");

  React.useEffect(() => {
    const handleScroll = () => {
      const sections = LINKS.map((link) => link.to.replace("#", ""));
      const currentSection = sections.find((section) => {
        const element = document.getElementById(section);

        if (!element) return false;

        const rect = element.getBoundingClientRect();
        return rect.top <= 150 && rect.bottom > 150;
      });

      if (currentSection) setActiveSection(currentSection);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleNavigate = (to: string) => {
    setOpen(false);
    const element = document.getElementById(to.replace("#", ""));
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderLinks = () =>
    LINKS.map((link) => {
      const sectionId = link.to.replace("#", "");
      const isActive = activeSection === sectionId;

      return (
        <button
          key={link.to}
          type="button"
          className={`group flex min-h-12 w-full cursor-pointer items-center gap-4 border-0 bg-transparent py-2 text-left font-mono text-[clamp(1.15rem,6vw,1.65rem)] font-medium uppercase tracking-[0.04em] text-text-tertiary transition-all duration-200 hover:translate-x-1 hover:text-accent focus-visible:translate-x-1 focus-visible:text-accent lg:min-h-8 lg:w-auto lg:gap-[0.65rem] lg:p-1 lg:pl-0 lg:text-[0.66rem] lg:tracking-[0.06em] ${
            isActive ? "translate-x-1 text-accent" : ""
          } ${
            sectionId === "contact"
              ? "mt-5 border-t border-border pt-5 text-accent normal-case lg:mt-3 lg:pt-3"
              : ""
          }`}
          onClick={() => handleNavigate(link.to)}
          aria-current={isActive ? "page" : undefined}
        >
          <span
            className={`block shrink-0 rotate-45 border border-current transition-all duration-200 ${
              sectionId === "contact"
                ? `h-px w-[0.4rem] rotate-0 border-0 bg-current ${isActive ? "scale-x-[1.7]" : ""}`
                : "h-2 w-2 group-hover:scale-110 lg:h-[0.3rem] lg:w-[0.3rem]"
            } ${isActive && sectionId !== "contact" ? "bg-current" : ""}`}
            aria-hidden="true"
          />
          <span
            className={
              sectionId === "contact"
                ? "border-b border-current font-sans text-[clamp(1.2rem,6vw,1.7rem)] font-bold italic normal-case leading-8 tracking-[0.015em] lg:text-[0.74rem] lg:leading-6"
                : ""
            }
          >
            {link.name}
          </span>
        </button>
      );
    });

  return (
    <header className="pointer-events-none fixed inset-0 z-50">
      <a
        href="/"
        className="pointer-events-auto fixed left-5 top-5 z-20 flex items-center gap-2 font-mono text-[0.95rem] font-bold uppercase tracking-[-0.04em] text-accent lg:left-8 lg:top-8"
        onClick={(event) => {
          event.preventDefault();
          handleNavigate("#profile");
        }}
        aria-label="Kembali ke profil"
      >
        <span className="font-sans text-[1.05rem] font-bold tracking-[-0.07em] leading-none">RLSMP</span>
      </a>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="pointer-events-auto fixed right-4 top-3 z-20 grid h-12 w-12 place-items-center rounded-full border border-border bg-surface/80 text-2xl text-accent backdrop-blur-md transition-colors hover:border-accent sm:right-5 sm:top-4 lg:hidden"
        aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
        aria-expanded={open}
      >
        {open ? <RxCross2 /> : <RxHamburgerMenu />}
      </button>

      <button
        type="button"
        aria-label="Tutup menu navigasi"
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
        className={`pointer-events-auto fixed inset-0 z-0 bg-surface/95 backdrop-blur-md transition-opacity duration-300 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      <nav
        aria-label="Navigasi utama"
        className={`fixed inset-x-5 top-1/2 z-10 flex -translate-y-1/2 flex-col items-start gap-1 transition-all duration-300 sm:inset-x-8 lg:inset-auto lg:left-8 lg:top-1/2 lg:translate-y-[-50%] lg:opacity-100 ${
          open
            ? "pointer-events-auto visible translate-x-0 opacity-100"
            : "pointer-events-none invisible -translate-x-3 opacity-0 lg:pointer-events-auto lg:visible lg:translate-x-0"
        }`}
      >
        {renderLinks()}
      </nav>
    </header>
  );
};

export default Navbar;

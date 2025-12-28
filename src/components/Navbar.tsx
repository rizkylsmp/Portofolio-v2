import React from "react";
import { HiMoon } from "react-icons/hi";
import { RxHamburgerMenu, RxCross2 } from "react-icons/rx";

const Navbar = () => {
  const Links = [
    { name: "Profile", to: "#profile" },
    { name: "Skills", to: "#skills" },
    { name: "Experience", to: "#experience" },
    { name: "Projects", to: "#projects" },
    { name: "Certificate", to: "#certificate" },
    { name: "Contact", to: "#contact" },
  ];

  const [open, setOpen] = React.useState(false);

  const handleNavigate = (to: string) => {
    setOpen(false);
    // Scroll ke section
    const sectionId = to.replace('#', '');
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed z-50 w-full p-5">
      <nav
        className="flex justify-between px-6 py-3 items-center top-0 left-0 right-0 bg-accent rounded-2xl"
      >
        {/* LOGO */}
        <div>
          <a href="/" className="flex gap-2 font-bold text-xl items-center text-surface">
            <HiMoon />
            RLSMP
          </a>
        </div>

        <div
          onClick={() => setOpen(!open)}
          className="text-2xl cursor-pointer md:hidden text-surface"
        >
          {open ? <RxCross2 /> : <RxHamburgerMenu />}
        </div>

        {/* MENU */}

        <div
          className={`md:flex-row md:gap-6 md:bg-transparent md:static md:translate-x-0 md:py-0 md:opacity-100 md:translate-y-0 transform rounded-2xl absolute flex flex-col gap-10 top-20 py-10 mx-5 items-center right-0 left-0 transition-all duration-500 ease-in-out bg-accent text-surface ${
            open ? "block " : "translate-y-[-200vh]"
          }`}
          >
          {Links.map((link, index) => (
            <button
            key={index}
            className="hover:underline duration-500 bg-none border-none cursor-pointer"
            onClick={() => handleNavigate(link.to)}
            >
              {link.name}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;

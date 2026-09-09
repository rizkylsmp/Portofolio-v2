import { useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Theme from "../components/tools/Theme";
import ScrollToTop from "../components/ScrollToTop";
import ProfilePage from "../pages/ProfilePage";
import SkillPage from "../pages/SkillsPage";
import ExperiencePage from "../pages/ExperiencePage";
import ProjectsPage from "../pages/ProjectsPage";
import CertificatePage from "../pages/CertificatePage";
import ContactPage from "../pages/ContactPage";

const RootLayout = () => {
  const snapLocked = useRef(false);

  useEffect(() => {
    const sectionIds = ["profile", "skills", "experience", "projects", "certificates", "contact"];

    const handleWheel = (event: WheelEvent) => {
      if (snapLocked.current || Math.abs(event.deltaY) < 4 || event.ctrlKey) return;

      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter((section): section is HTMLElement => Boolean(section));
      if (sections.length === 0) return;

      const scrollTop = window.scrollY;
      const viewportHeight = window.innerHeight;
      const currentIndex = sections.findIndex((section, index) => {
        const nextTop = sections[index + 1]?.offsetTop ?? Number.POSITIVE_INFINITY;
        return scrollTop >= section.offsetTop - 2 && scrollTop < nextTop - 2;
      });
      if (currentIndex < 0) return;

      const current = sections[currentIndex];
      const sectionTop = current.offsetTop;
      const sectionBottom = sectionTop + current.offsetHeight;
      const isLongSection = current.offsetHeight > viewportHeight + 4;
      const wheelTravel = Math.max(Math.abs(event.deltaY), 8);
      const scrollingDown = event.deltaY > 0;
      const atBottom = scrollTop + viewportHeight + wheelTravel >= sectionBottom;
      const atTop = scrollTop - wheelTravel <= sectionTop;

      if (isLongSection && ((scrollingDown && !atBottom) || (!scrollingDown && !atTop))) {
        return;
      }

      const targetIndex = scrollingDown ? currentIndex + 1 : currentIndex - 1;
      const target = sections[targetIndex];
      if (!target) return;

      event.preventDefault();
      snapLocked.current = true;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        snapLocked.current = false;
      }, 700);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div>
      <Navbar />
      <Theme />
      <ScrollToTop />
      <main className="min-w-0 bg-surface lg:ml-[clamp(6.5rem,8vw,8rem)]">
        <section id="profile" className="min-h-svh">
          <ProfilePage />
        </section>
        <section id="skills" className="min-h-svh">
          <SkillPage />
        </section>
        <section id="experience" className="min-h-svh">
          <ExperiencePage />
        </section>
        <section id="projects" className="min-h-svh">
          <ProjectsPage />
        </section>
        <section id="certificates" className="min-h-svh">
          <CertificatePage />
        </section>
        <section id="contact" className="min-h-svh">
          <ContactPage />
        </section>
      </main>
    </div>
  );
};

export default RootLayout;

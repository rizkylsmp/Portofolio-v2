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
  return (
    <div>
      <Navbar />
      <Theme />
      <ScrollToTop />
      <main className="bg-surface">
        <section id="profile">
          <ProfilePage />
        </section>
        <section id="skills">
          <SkillPage />
        </section>
        <section id="experience">
          <ExperiencePage />
        </section>
        <section id="projects">
          <ProjectsPage />
        </section>
        <section id="certificates">
          <CertificatePage />
        </section>
        <section id="contact">
          <ContactPage />
        </section>
      </main>
    </div>
  );
};

export default RootLayout;

import Navbar from '../components/Navbar'
import Theme from '../components/tools/Theme'
import ProfilePage from '../pages/ProfilePage'
import SkillPage from '../pages/SkillsPage'
import ExperiencePage from '../pages/ExperiencePage'
import ProjectsPage from "../pages/ProjectsPage"

const RootLayout = () => {

    return (
    <div>
        <Navbar />
        <Theme />
        <main className='bg-surface'>
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
        </main>
    </div>
    )
}

export default RootLayout
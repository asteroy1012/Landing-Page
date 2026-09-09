import Grain from './components/Grain'
import Topbar from './components/Topbar'
import Rail from './components/Rail'
import Hero from './components/Hero'
import SourceSection from './components/SourceSection'
import ExperienceSection from './components/ExperienceSection'
import ProjectsSection from './components/ProjectsSection'
import SkillsSection from './components/SkillsSection'
import ConnectSection from './components/ConnectSection'
import Footer from './components/Footer'
import { useActiveSection } from './hooks/useActiveSection'
import { SECTIONS } from './data/content'

const SECTION_KEYS = SECTIONS.map((s) => s.key)

export default function App() {
  const { activeKey, railVisible, heroRef, registerSection } = useActiveSection(SECTION_KEYS)

  return (
    <>
      <Grain />
      <Topbar />
      <Rail activeKey={activeKey} visible={railVisible} />
      <main>
        <Hero heroRef={heroRef} />
        <SourceSection registerRef={registerSection('source')} />
        <ExperienceSection registerRef={registerSection('experience')} />
        <ProjectsSection registerRef={registerSection('projects')} />
        <SkillsSection registerRef={registerSection('skills')} />
        <ConnectSection registerRef={registerSection('connect')} />
        <Footer />
      </main>
    </>
  )
}

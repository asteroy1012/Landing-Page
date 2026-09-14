import Grain from './components/Grain'
import Cursor from './components/Cursor'
import Topbar from './components/Topbar'
import Rail from './components/Rail'
import Hero from './components/Hero'
import SourceSection from './components/SourceSection'
import TimelineSection from './components/TimelineSection'
import ProjectsSection from './components/ProjectsSection'
import SkillsSection from './components/SkillsSection'
import ConnectSection from './components/ConnectSection'
import Footer from './components/Footer'
import { useActiveSection } from './hooks/useActiveSection'
import { useTheme } from './hooks/useTheme'
import { SECTIONS } from './data/content'

const SECTION_KEYS = SECTIONS.map((s) => s.key)

export default function App() {
  const { activeKey, railVisible, heroRef, registerSection } = useActiveSection(SECTION_KEYS)
  const { theme, toggle } = useTheme()

  return (
    <>
      <Grain />
      <Cursor />
      <Topbar theme={theme} onToggleTheme={toggle} />
      <Rail activeKey={activeKey} visible={railVisible} />
      <main>
        <Hero heroRef={heroRef} theme={theme} />
        <SourceSection registerRef={registerSection('source')} />
        <TimelineSection registerRef={registerSection('timeline')} theme={theme} />
        <ProjectsSection registerRef={registerSection('projects')} />
        <SkillsSection registerRef={registerSection('skills')} />
        <ConnectSection registerRef={registerSection('connect')} />
        <Footer />
      </main>
    </>
  )
}

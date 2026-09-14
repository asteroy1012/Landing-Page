import { PROJECTS } from '../data/content'
import { useTilt } from '../hooks/useTilt'
import ProjectIcon from './ProjectIcon'
import TypeTitle from './TypeTitle'

function ProjectCard({ project }) {
  const tiltRef = useTilt(3)
  return (
    <article className="card" ref={tiltRef}>
      <span className="bracket tl" />
      <span className="bracket tr" />
      <span className="bracket bl" />
      <span className="bracket br" />
      <ProjectIcon name={project.icon} />
      <div className="card-tag">{project.tag}</div>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <div className="card-meta">{project.meta}</div>
    </article>
  )
}

export default function ProjectsSection({ registerRef }) {
  return (
    <section className="section band-paper" id="projects" data-key="projects" ref={registerRef}>
      <div className="section-inner">
        <span className="eyebrow">[ 02 / Projects ]</span>
        <TypeTitle className="section-title" lines={['Independent research, shipped anyway.']} />
        <div className="card-grid">
          {PROJECTS.map((p) => (
            <ProjectCard project={p} key={p.title} />
          ))}
        </div>
      </div>
    </section>
  )
}

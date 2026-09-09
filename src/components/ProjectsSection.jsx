import { PROJECTS } from '../data/content'
import ProjectIcon from './ProjectIcon'

export default function ProjectsSection({ registerRef }) {
  return (
    <section className="section band-paper" id="projects" data-key="projects" ref={registerRef}>
      <div className="section-inner">
        <span className="eyebrow">[ 02 / Projects ]</span>
        <h2 className="section-title">Independent research, shipped anyway.</h2>
        <div className="card-grid">
          {PROJECTS.map((p) => (
            <article className="card" key={p.title}>
              <span className="bracket tl" />
              <span className="bracket tr" />
              <span className="bracket bl" />
              <span className="bracket br" />
              <ProjectIcon name={p.icon} />
              <div className="card-tag">{p.tag}</div>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <div className="card-meta">{p.meta}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

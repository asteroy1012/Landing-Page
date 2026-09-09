import { EXPERIENCE } from '../data/content'

export default function ExperienceSection({ registerRef }) {
  return (
    <section className="section" id="experience" data-key="experience" ref={registerRef}>
      <div className="section-inner">
        <span className="eyebrow">[ 01 / Experience ]</span>
        <h2 className="section-title">Where the lineage runs through.</h2>
        <ul className="case-list">
          {EXPERIENCE.map((job) => (
            <li className="case-row" tabIndex={0} key={job.index}>
              <div className="case-index">{job.index}</div>
              <div className="case-main">
                <p className="case-title">{job.company}</p>
                <p className="case-role">{job.role}</p>
                <div className="case-detail">{job.detail}</div>
              </div>
              <div className="case-dates">{job.dates}</div>
              <div className="case-arrow">→</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

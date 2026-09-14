import { SKILL_GROUPS } from '../data/content'
import TypeTitle from './TypeTitle'

export default function SkillsSection({ registerRef }) {
  return (
    <section className="section" id="skills" data-key="skills" ref={registerRef}>
      <div className="section-inner">
        <span className="eyebrow">[ 03 / Skills ]</span>
        <TypeTitle className="section-title" lines={['The toolkit behind the trace.']} />
        <div className="skill-groups">
          {SKILL_GROUPS.map((group) => (
            <div className="skill-group" key={group.title}>
              <h4>{group.title}</h4>
              <div className="chip-row">
                {group.skills.map((skill) => (
                  <span className="chip" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

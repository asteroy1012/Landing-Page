import { CONTACT } from '../data/content'

export default function ConnectSection({ registerRef }) {
  return (
    <section className="section" id="connect" data-key="connect" ref={registerRef}>
      <div className="section-inner connect-inner">
        <span className="eyebrow">[ 04 / Connect ]</span>
        <h2 className="cta-title">
          Let's trace a path
          <br />
          together.
        </h2>
        <a className="cta-btn" href={`mailto:${CONTACT.email}`}>
          Send an email <span className="cta-arrow">→</span>
        </a>
        <div className="contact-links">
          <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
            linkedin.com/in/aditya-raj2002
          </a>
          <a href={CONTACT.github} target="_blank" rel="noopener noreferrer">
            github.com/asteroy1012
          </a>
        </div>
      </div>
    </section>
  )
}

import { useWordReveal } from '../hooks/useWordReveal'
import { useConstellation } from '../hooks/useConstellation'
import { CONSTELLATION } from '../data/content'

const REVEAL_TEXT =
  'I turn tangled banking metadata into lineage anyone can walk backward, from a number on a dashboard to the exact upstream system it came from, verified at every hop.'

export default function SourceSection({ registerRef }) {
  const { containerRef: revealRef, wordRefs, words } = useWordReveal(REVEAL_TEXT)
  const { sectionRef, pathRefs, labelRefs, centerRef, centerLabelRef } = useConstellation(CONSTELLATION.paths.length)
  const { center } = CONSTELLATION

  return (
    <section
      className="section"
      id="source"
      data-key="source"
      ref={(el) => {
        sectionRef.current = el
        registerRef(el)
      }}
    >
      <div className="section-inner source-grid">
        <div className="constellation-wrap">
          <svg viewBox="0 0 560 420" aria-hidden="true">
            {CONSTELLATION.paths.map((p, i) => (
              <path
                key={p.id}
                ref={(el) => (pathRefs.current[i] = el)}
                d={p.d}
                fill="none"
                stroke="var(--ink-faint)"
                strokeWidth="1.2"
              />
            ))}
            {CONSTELLATION.paths.map((p, i) => (
              <text key={p.label} ref={(el) => (labelRefs.current[i] = el)} x={p.labelX} y={p.labelY}>
                {p.label}
              </text>
            ))}
            <circle ref={centerRef} cx={center.x} cy={center.y} r="5" fill="var(--accent)" />
            <text
              ref={centerLabelRef}
              x={center.x}
              y={center.y + 28}
              textAnchor="middle"
              fill="var(--accent)"
              fontWeight="600"
            >
              {center.label}
            </text>
          </svg>
        </div>
        <div>
          <span className="eyebrow">[ 00 / Source ]</span>
          <p className="reveal-p" ref={revealRef}>
            {words.map((w, i) => (
              <span key={i} className="rw" ref={(el) => (wordRefs.current[i] = el)}>
                {w}{' '}
              </span>
            ))}
          </p>
          <p className="bio-line">
            B.Tech Computer Science, VIT — GPA 8.78/10 · Chennai, India · AWS Certified Solutions Architect &amp;
            Cloud Practitioner
          </p>
        </div>
      </div>
    </section>
  )
}

import { useEffect, useState } from 'react'
import { TIMELINE, AT_A_GLANCE } from '../data/content'
import { useRailProgress } from '../hooks/useRailProgress'
import TypeTitle from './TypeTitle'
import TimelineShape from './TimelineShape'

export default function TimelineSection({ registerRef, theme }) {
  const { listRef, railRef } = useRailProgress()
  const [activeIndex, setActiveIndex] = useState(0)

  // Whichever step crosses the middle of the viewport drives the shape.
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveIndex(Number(entry.target.dataset.index))
        })
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    list.querySelectorAll('.timeline-item').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [listRef])

  const active = TIMELINE[activeIndex]

  return (
    <section className="section" id="timeline" data-key="timeline" ref={registerRef}>
      <div className="section-inner">
        <div className="section-head">
          <span className="eyebrow">[ 01 / Timeline ]</span>
          <span className="section-rule" aria-hidden="true" />
        </div>
        <TypeTitle className="section-title" lines={['Trace it back to the source.']} />
        <p className="section-lede">Six steps from a first year at VIT to auditing lineage for a global bank.</p>

        <div className="timeline-grid">
          <div className="timeline" ref={listRef}>
            <span className="timeline-rail" aria-hidden="true" />
            <span className="timeline-rail timeline-rail--fill" aria-hidden="true" ref={railRef} />
            <ol className="timeline-list">
              {TIMELINE.map((item, i) => (
                <li className="timeline-item" key={item.step} data-index={i}>
                  <span className="timeline-dot" aria-hidden="true" />
                  <div className="timeline-body">
                    <span className="timeline-step">
                      Step {item.step} <span className="timeline-year">{item.year}</span>
                    </span>
                    <h3 className="timeline-title">{item.title}</h3>
                    <p className="timeline-text">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <aside className="glance">
            <TimelineShape step={active.step} total={TIMELINE.length} title={active.title} theme={theme} />
            <div className="glance-card">
              <h4 className="glance-head">At a glance</h4>
              <ul className="glance-list">
                {AT_A_GLANCE.map((line) => (
                  <li key={line}>
                    <span aria-hidden="true">—</span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

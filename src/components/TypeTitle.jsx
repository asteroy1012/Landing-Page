import { useEffect, useRef, useState } from 'react'

// Splits a title into per-character spans that rise into place one after
// another once the title scrolls into view. Words stay intact for wrapping,
// and screen readers get the plain text via aria-label.
export default function TypeTitle({ as: Tag = 'h2', className = '', lines }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  let index = 0

  return (
    <Tag ref={ref} className={`type-title ${className}${inView ? ' is-in' : ''}`} aria-label={lines.join(' ')}>
      {lines.map((line, li) => (
        <span className="type-line" aria-hidden="true" key={li}>
          {line.split(' ').map((word, wi, words) => (
            <span key={wi}>
              <span className="type-word">
                {[...word].map((ch, ci) => (
                  <span className="type-char" style={{ '--i': index++ }} key={ci}>
                    {ch}
                  </span>
                ))}
              </span>
              {wi < words.length - 1 && ' '}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  )
}

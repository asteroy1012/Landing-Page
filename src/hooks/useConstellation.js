import { useEffect, useRef } from 'react'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

// Draws the three connector paths in sequence and fades their labels in
// as the Source section scrolls into view, then pulses the center node.
export function useConstellation(pathCount) {
  const sectionRef = useRef(null)
  const pathRefs = useRef([])
  const labelRefs = useRef([])
  const centerRef = useRef(null)
  const centerLabelRef = useRef(null)
  const lengths = useRef([])

  useEffect(() => {
    lengths.current = pathRefs.current.map((p) => (p ? p.getTotalLength() : 0))
    pathRefs.current.forEach((p, i) => {
      if (p) p.style.strokeDasharray = String(lengths.current[i])
    })

    let raf
    const update = () => {
      const section = sectionRef.current
      if (section) {
        const rect = section.getBoundingClientRect()
        const vh = window.innerHeight
        const sp = clamp((vh * 0.85 - rect.top) / (vh * 0.65), 0, 1)

        pathRefs.current.forEach((p, i) => {
          if (!p) return
          const local = clamp((sp - i * 0.16) / 0.42, 0, 1)
          p.style.strokeDashoffset = String(lengths.current[i] * (1 - local))
          const label = labelRefs.current[i]
          if (label) label.style.opacity = (0.15 + 0.85 * local).toFixed(2)
        })

        const centerP = clamp((sp - 0.55) / 0.35, 0, 1)
        if (centerRef.current) {
          centerRef.current.setAttribute('opacity', centerP.toFixed(2))
          centerRef.current.setAttribute('r', (4 + 3 * centerP).toFixed(1))
        }
        if (centerLabelRef.current) centerLabelRef.current.style.opacity = centerP.toFixed(2)
      }
      raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [pathCount])

  return { sectionRef, pathRefs, labelRefs, centerRef, centerLabelRef }
}

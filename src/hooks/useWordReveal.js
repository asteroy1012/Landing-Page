import { useEffect, useMemo, useRef } from 'react'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

// Word-by-word scroll-scrubbed opacity reveal, tied directly to scroll
// position (not a CSS transition) so it feels pinned to the scrollbar.
export function useWordReveal(text) {
  const containerRef = useRef(null)
  const wordRefs = useRef([])
  const words = useMemo(() => text.trim().split(/\s+/), [text])

  useEffect(() => {
    let raf
    const update = () => {
      const el = containerRef.current
      if (el) {
        const rect = el.getBoundingClientRect()
        const vh = window.innerHeight
        const progress = clamp((vh * 0.82 - rect.top) / (vh * 0.5), 0, 1)
        const n = wordRefs.current.length
        wordRefs.current.forEach((w, i) => {
          if (!w) return
          const wp = clamp(progress * n - i, 0, 1)
          w.style.opacity = (0.26 + 0.74 * wp).toFixed(3)
        })
      }
      raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [words])

  return { containerRef, wordRefs, words }
}

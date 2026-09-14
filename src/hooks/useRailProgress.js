import { useEffect, useRef } from 'react'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

// Scales a vertical rail from 0 to 1 as the list scrolls through the
// viewport, so the filled line tracks how far down the timeline you are.
export function useRailProgress() {
  const listRef = useRef(null)
  const railRef = useRef(null)

  useEffect(() => {
    let raf
    const update = () => {
      const list = listRef.current
      const rail = railRef.current
      if (list && rail) {
        const rect = list.getBoundingClientRect()
        const vh = window.innerHeight
        // Fills as the list travels from 75% down the viewport up past 45%.
        const start = vh * 0.75
        const distance = rect.height + vh * 0.3
        const progress = clamp((start - rect.top) / distance, 0, 1)
        rail.style.transform = `scaleY(${progress.toFixed(4)})`
      }
      raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [])

  return { listRef, railRef }
}

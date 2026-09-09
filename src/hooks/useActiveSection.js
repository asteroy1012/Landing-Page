import { useEffect, useRef, useState } from 'react'

// Tracks which section is currently centered in the viewport (for the
// left rail) and whether the hero has been scrolled past (to reveal it).
export function useActiveSection(sectionKeys) {
  const [activeKey, setActiveKey] = useState(sectionKeys[0])
  const [railVisible, setRailVisible] = useState(false)
  const heroRef = useRef(null)
  const sectionRefs = useRef({})

  useEffect(() => {
    const heroObserver = new IntersectionObserver(
      ([entry]) => setRailVisible(!entry.isIntersecting),
      { threshold: 0.15 },
    )
    if (heroRef.current) heroObserver.observe(heroRef.current)

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveKey(entry.target.dataset.key)
        })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    sectionKeys.forEach((key) => {
      const el = sectionRefs.current[key]
      if (el) sectionObserver.observe(el)
    })

    return () => {
      heroObserver.disconnect()
      sectionObserver.disconnect()
    }
  }, [sectionKeys])

  const registerSection = (key) => (el) => {
    sectionRefs.current[key] = el
  }

  return { activeKey, railVisible, heroRef, registerSection }
}

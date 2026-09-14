import { useEffect, useRef } from 'react'

const INTERACTIVE = 'a, button, [role="switch"], [data-cursor="link"]'

// A blend-difference dot that rides the pointer and swells over anything
// interactive. Purely decorative — the native cursor stays visible, and the
// whole thing is suppressed on touch/coarse pointers via CSS.
export default function Cursor() {
  const dotRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches
    if (coarse) return

    const dot = dotRef.current
    const label = labelRef.current
    if (!dot) return

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    let raf
    // What the pointer is currently over, independent of whether the dot is
    // visible — so leaving and re-entering the window restores the right size.
    let hoverState = 'default'

    const render = () => {
      dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`
      raf = requestAnimationFrame(render)
    }

    const onMove = (e) => {
      pos.x = e.clientX
      pos.y = e.clientY
      if (dot.dataset.state === 'hidden') dot.dataset.state = hoverState
    }

    const onOver = (e) => {
      const hit = e.target.closest?.(INTERACTIVE)
      if (hit) {
        const custom = hit.getAttribute('data-cursor-label')
        hoverState = custom ? 'view' : 'link'
        if (label) label.textContent = custom || ''
      } else {
        hoverState = 'default'
        if (label) label.textContent = ''
      }
      dot.dataset.state = hoverState
    }

    const hide = () => {
      dot.dataset.state = 'hidden'
    }

    // pointerout with no relatedTarget means the pointer left the window
    // entirely, rather than just moving between elements inside it.
    const onOut = (e) => {
      if (!e.relatedTarget) hide()
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    document.addEventListener('pointerout', onOut)
    window.addEventListener('blur', hide)
    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      window.removeEventListener('blur', hide)
    }
  }, [])

  return (
    <div className="hv-cursor" data-state="hidden" aria-hidden="true" ref={dotRef}>
      <span className="hv-cursor__label" ref={labelRef} />
    </div>
  )
}

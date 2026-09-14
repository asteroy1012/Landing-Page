import { useEffect, useRef } from 'react'

// Spring constants tuned to match the reference: a slight overshoot past
// rest on release, settling in roughly 700ms.
const STIFFNESS = 260
const DAMPING = 22
const EPSILON = 0.001

// Tilts an element in 3D toward the pointer, driven by a damped spring so
// it eases in and swings back past rest when the pointer leaves.
export function useTilt(maxDeg = 3) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce), (hover: none), (pointer: coarse)').matches) return

    const s = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 }
    let raf = 0
    let last = 0

    const apply = () => {
      el.style.transform = `perspective(900px) rotateX(${s.x.toFixed(3)}deg) rotateY(${s.y.toFixed(3)}deg)`
    }

    const step = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 30)
      last = now

      const ax = -STIFFNESS * (s.x - s.tx) - DAMPING * s.vx
      const ay = -STIFFNESS * (s.y - s.ty) - DAMPING * s.vy
      s.vx += ax * dt
      s.vy += ay * dt
      s.x += s.vx * dt
      s.y += s.vy * dt

      const settled =
        Math.abs(s.x - s.tx) < EPSILON &&
        Math.abs(s.y - s.ty) < EPSILON &&
        Math.abs(s.vx) < EPSILON &&
        Math.abs(s.vy) < EPSILON

      if (settled) {
        s.x = s.tx
        s.y = s.ty
        s.vx = 0
        s.vy = 0
        apply()
        raf = 0
        return
      }
      apply()
      raf = requestAnimationFrame(step)
    }

    const run = () => {
      if (raf) return
      last = performance.now()
      raf = requestAnimationFrame(step)
    }

    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      // Pointer at the top pushes the top edge away; pointer at the right
      // pushes the right edge away.
      s.tx = (0.5 - py) * 2 * maxDeg
      s.ty = (px - 0.5) * 2 * maxDeg
      run()
    }

    const onLeave = () => {
      s.tx = 0
      s.ty = 0
      run()
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      el.style.transform = ''
    }
  }, [maxDeg])

  return ref
}

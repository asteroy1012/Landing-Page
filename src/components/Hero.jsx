import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

const WORD = 'hello'
// Borel is a single-weight script; the fallback keeps the canvas legible
// for the moment before the web font finishes loading.
const FONT_FAMILY = "Borel, 'Brush Script MT', cursive"
const FONT_WEIGHT = 400

// Scroll distance (in viewport heights) the stage stays pinned; the section
// is 250lvh tall, so 150lvh of it is pinned travel.
const PIN_VIEWPORTS = 1.5
// The name has fully slid off after this many viewports of scrolling.
const NAME_EXIT = 0.45

// The word stays centred; scrolling only grows it and lifts it slightly.
// x/y are % of the stage, scale is a multiplier.
const MOTION = {
  from: { y: 0, scale: 1 },
  mid: { y: -9, scale: 1.22 },
  to: { y: -16, scale: 1.42 },
}

// Handwriting reveal: starts as the intro window opens, writes each letter
// at a pace proportional to its width, with a short lift between letters.
const WRITE_DELAY_MS = 1900
const WRITE_DURATION_MS = 1100
const LETTER_PAUSE_MS = 35
const FEATHER = 0.06

const PALETTES = {
  dark: { bg: '11, 13, 10', ink: '#f47a2a' },
  light: { bg: '233, 236, 231', ink: '#f47a2a' },
}

const lerp = (a, b, t) => a + (b - a) * t
const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2

function sampleMotion(progress) {
  const { from, mid, to } = MOTION
  const p = Math.min(Math.max(progress, 0), PIN_VIEWPORTS)
  const [a, b, t] = p <= 1 ? [from, mid, p] : [mid, to, (p - 1) / (PIN_VIEWPORTS - 1)]
  return { y: lerp(a.y, b.y, t), scale: lerp(a.scale, b.scale, t) }
}

function Chars({ text, offset }) {
  return [...text].map((ch, i) => (
    <span className="name-hero__mask" key={i}>
      <span className="name-hero__char" style={{ '--i': offset + i }}>
        {ch}
      </span>
    </span>
  ))
}

export default function Hero({ heroRef, theme }) {
  const canvasRef = useRef(null)
  const topLineRef = useRef(null)
  const bottomLineRef = useRef(null)
  const metaRef = useRef(null)
  // Kept outside the effect so a theme switch or resize doesn't replay the writing.
  const writeStartRef = useRef(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const section = heroRef.current
    const canvas = canvasRef.current
    if (!section || !canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    const palette = PALETTES[theme] ?? PALETTES.dark
    if (writeStartRef.current === null) writeStartRef.current = performance.now() + WRITE_DELAY_MS

    // Word geometry in font pixels, relative to the word's centre.
    const word = { font: 0, drawX: 0, baseline: 0, inkLeft: 0, inkRight: 0, height: 0, letters: [] }
    const size = { w: 0, h: 0, dpr: 1 }
    let lastProgress = -1
    let lastReveal = -1
    let raf = 0

    const setFont = (px) => {
      ctx.font = `${FONT_WEIGHT} ${px}px ${FONT_FAMILY}`
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'
    }

    const measure = () => {
      size.w = canvas.clientWidth
      size.h = canvas.clientHeight
      size.dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(size.w * size.dpr)
      canvas.height = Math.round(size.h * size.dpr)

      setFont(100)
      const ref = ctx.measureText(WORD)
      const refInkWidth = ref.actualBoundingBoxLeft + ref.actualBoundingBoxRight || ref.width || 1
      const refInkHeight = ref.actualBoundingBoxAscent + ref.actualBoundingBoxDescent || 100
      // Fits comfortably inside the stage, wider share on narrow screens.
      const widthShare = size.w > size.h ? 0.72 : 0.9
      word.font = Math.min((100 * size.w * widthShare) / refInkWidth, (100 * size.h * 0.55) / refInkHeight)

      setFont(word.font)
      const m = ctx.measureText(WORD)
      const inkWidth = m.actualBoundingBoxLeft + m.actualBoundingBoxRight
      // Place the left-aligned text so its ink, not its advance box, is centred.
      word.drawX = (m.actualBoundingBoxLeft - m.actualBoundingBoxRight) / 2
      // Borel's line box is far taller than its letters; centre on the glyphs.
      word.baseline = (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2
      word.inkLeft = word.drawX - m.actualBoundingBoxLeft
      word.inkRight = word.inkLeft + inkWidth
      word.height = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent

      // Letter boundaries from prefix advances, clamped to the ink extents.
      const bounds = [word.inkLeft]
      for (let i = 1; i < WORD.length; i++) {
        const x = word.drawX + ctx.measureText(WORD.slice(0, i)).width
        bounds.push(Math.min(Math.max(x, word.inkLeft), word.inkRight))
      }
      bounds.push(word.inkRight)
      word.letters = WORD.split('').map((_, i) => ({ x0: bounds[i], x1: bounds[i + 1] }))

      lastProgress = -1
      lastReveal = -1
    }

    // How far (in font px from the ink's left edge) the pen has written.
    const revealAt = (now) => {
      const inkWidth = word.inkRight - word.inkLeft
      if (reducedMotion) return inkWidth
      const writingTime = WRITE_DURATION_MS
      let elapsed = now - writeStartRef.current
      if (elapsed <= 0) return 0
      for (const letter of word.letters) {
        const span = letter.x1 - letter.x0
        const duration = (span / inkWidth) * writingTime
        if (elapsed < duration) return letter.x0 - word.inkLeft + span * easeInOutSine(elapsed / duration)
        elapsed -= duration + LETTER_PAUSE_MS
        if (elapsed < 0) return letter.x1 - word.inkLeft
      }
      return inkWidth
    }

    const draw = (progress, revealed) => {
      const { w, h, dpr } = size
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = `rgb(${palette.bg})`
      ctx.fillRect(0, 0, w, h)

      if (revealed > 0) {
        const { y, scale } = sampleMotion(progress)
        const inkWidth = word.inkRight - word.inkLeft
        const edgeX = word.inkLeft + revealed
        const feather = inkWidth * FEATHER
        const top = -word.height
        const band = word.height * 2

        ctx.save()
        ctx.translate(w / 2, h / 2 + (y / 100) * h)
        ctx.scale(scale, scale)
        ctx.beginPath()
        ctx.rect(word.inkLeft - feather, top, revealed + feather, band)
        ctx.clip()
        setFont(word.font)
        ctx.textAlign = 'left'
        ctx.textBaseline = 'alphabetic'
        ctx.fillStyle = palette.ink
        ctx.fillText(WORD, word.drawX, word.baseline)
        // The page behind the word is a flat colour, so fading that colour
        // back over the leading edge reads as ink still flowing in.
        if (revealed < inkWidth) {
          const g = ctx.createLinearGradient(edgeX - feather, 0, edgeX, 0)
          g.addColorStop(0, `rgba(${palette.bg}, 0)`)
          g.addColorStop(1, `rgba(${palette.bg}, 1)`)
          ctx.fillStyle = g
          ctx.fillRect(edgeX - feather, top, feather, band)
        }
        ctx.restore()
      }

      const veil = 0.3 * (1 - Math.min(Math.max(progress, 0), PIN_VIEWPORTS) / PIN_VIEWPORTS)
      if (veil > 0) {
        ctx.fillStyle = `rgba(${palette.bg}, ${veil})`
        ctx.fillRect(0, 0, w, h)
      }
    }

    const tick = (now) => {
      const vh = window.innerHeight
      const scrolled = Math.min(Math.max(-section.getBoundingClientRect().top, 0), PIN_VIEWPORTS * vh)
      const progress = reducedMotion ? 0 : scrolled / vh
      const revealed = revealAt(now)
      if (progress !== lastProgress || revealed !== lastReveal) {
        draw(progress, revealed)
        if (progress !== lastProgress) {
          const exit = Math.min(progress / NAME_EXIT, 1)
          if (topLineRef.current) topLineRef.current.style.transform = `translate3d(${-110 * exit}%, 0, 0)`
          if (bottomLineRef.current) bottomLineRef.current.style.transform = `translate3d(${110 * exit}%, 0, 0)`
          if (metaRef.current) metaRef.current.style.opacity = String(1 - exit)
        }
        lastProgress = progress
        lastReveal = revealed
      }
      raf = requestAnimationFrame(tick)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(canvas)
    // Canvas text falls back silently if Borel isn't loaded yet, so re-measure once it is.
    document.fonts?.load(`${FONT_WEIGHT} 100px Borel`).then(measure).catch(() => {})
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [heroRef, theme, reducedMotion])

  return (
    <section className="name-hero" id="heroSection" ref={heroRef}>
      <h1 className="sr-only">Aditya Raj</h1>
      <div className="name-hero__stage">
        <div className="name-hero__scene" aria-hidden="true">
          <div className="name-hero__scene-inner">
            <canvas ref={canvasRef} className="name-hero__canvas" />
          </div>
        </div>
        <div className="name-hero__content">
          <div className="name-hero__row" aria-hidden="true">
            <span className="name-hero__line" ref={topLineRef}>
              <Chars text="Aditya" offset={0} />
            </span>
          </div>
          <div className="name-hero__meta" ref={metaRef}>
            <span className="name-hero__rule" aria-hidden="true" />
            <div className="name-hero__labels">
              <span>Data Analyst</span>
              <span>Chennai, India</span>
            </div>
          </div>
          <div className="name-hero__row name-hero__row--end" aria-hidden="true">
            <span className="name-hero__line" ref={bottomLineRef}>
              <Chars text="Raj" offset={6} />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

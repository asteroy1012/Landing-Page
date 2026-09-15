import { useEffect, useRef } from 'react'
import lottie from 'lottie-web/build/player/lottie_light'
// "Hello (apple)" by Noé M on LottieFiles, used under the Lottie Simple License.
import helloAnimation from '../assets/hello-lottie.json'
import { useReducedMotion } from '../hooks/useReducedMotion'

// Cosmic orange (#F47A2A) as Lottie's 0–1 RGB.
const COSMIC_ORANGE = [0.957, 0.478, 0.165]

// Scroll distance (in viewport heights) the stage stays pinned; the section
// is 250lvh tall, so 150lvh of it is pinned travel.
const PIN_VIEWPORTS = 1.5
// The name has fully slid off after this many viewports of scrolling.
const NAME_EXIT = 0.45

// The word stays centred; scrolling only grows it and lifts it slightly.
// y is % of the stage height, scale is a multiplier.
const MOTION = {
  from: { y: 0, scale: 1 },
  mid: { y: -9, scale: 1.22 },
  to: { y: -16, scale: 1.42 },
}

// The source animation writes the word (frames 0–373) and then erases it;
// only the writing part is played, so the word stays on screen afterwards.
const WRITE_END_FRAME = 373
const WRITE_DELAY_MS = 1900
const WRITE_SPEED = 1.8

// The handwriting sits a touch below the centre of its square comp.
const INK_OFFSET = 'translate(-49.74%, -51%)'

// Rewrites every stroke/fill colour in the animation to one RGB value,
// keeping gradient stop offsets intact.
function recolor(animation, rgb) {
  const data = structuredClone(animation)
  const walk = (items) => {
    for (const item of items) {
      if (item.ty === 'gr') walk(item.it)
      if (item.ty === 'gs' || item.ty === 'gf') {
        const { p, k } = item.g
        for (let i = 0; i < p; i++) {
          k.k[i * 4 + 1] = rgb[0]
          k.k[i * 4 + 2] = rgb[1]
          k.k[i * 4 + 3] = rgb[2]
        }
      }
      if ((item.ty === 'st' || item.ty === 'fl') && item.c?.a === 0) item.c.k = [...rgb, 1]
    }
  }
  data.layers.forEach((layer) => layer.shapes && walk(layer.shapes))
  return data
}

const HELLO = recolor(helloAnimation, COSMIC_ORANGE)

const lerp = (a, b, t) => a + (b - a) * t

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

export default function Hero({ heroRef }) {
  const helloRef = useRef(null)
  const topLineRef = useRef(null)
  const bottomLineRef = useRef(null)
  const metaRef = useRef(null)
  const reducedMotion = useReducedMotion()

  // Write the word once as the intro opens, then hold the final frame.
  useEffect(() => {
    const container = helloRef.current
    if (!container) return
    const anim = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      animationData: HELLO,
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
    })
    let timer = 0
    const start = () => {
      if (reducedMotion) {
        anim.goToAndStop(WRITE_END_FRAME, true)
        return
      }
      anim.setSpeed(WRITE_SPEED)
      timer = window.setTimeout(() => anim.playSegments([0, WRITE_END_FRAME], true), WRITE_DELAY_MS)
    }
    anim.addEventListener('DOMLoaded', start)
    return () => {
      window.clearTimeout(timer)
      anim.destroy()
    }
  }, [reducedMotion])

  // Scroll: grow and lift the word, slide the name apart.
  useEffect(() => {
    const section = heroRef.current
    if (!section) return
    let lastProgress = -1
    let lastVh = -1
    let raf = 0

    const tick = () => {
      const vh = window.innerHeight
      const scrolled = Math.min(Math.max(-section.getBoundingClientRect().top, 0), PIN_VIEWPORTS * vh)
      const progress = reducedMotion ? 0 : scrolled / vh
      if (progress !== lastProgress || vh !== lastVh) {
        const { y, scale } = sampleMotion(progress)
        if (helloRef.current) {
          helloRef.current.style.transform = `${INK_OFFSET} translate3d(0, ${(y / 100) * vh}px, 0) scale(${scale})`
        }
        const exit = Math.min(progress / NAME_EXIT, 1)
        if (topLineRef.current) topLineRef.current.style.transform = `translate3d(${-110 * exit}%, 0, 0)`
        if (bottomLineRef.current) bottomLineRef.current.style.transform = `translate3d(${110 * exit}%, 0, 0)`
        if (metaRef.current) metaRef.current.style.opacity = String(1 - exit)
        lastProgress = progress
        lastVh = vh
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [heroRef, reducedMotion])

  return (
    <section className="name-hero" id="heroSection" ref={heroRef}>
      <h1 className="sr-only">Aditya Raj</h1>
      <div className="name-hero__stage">
        <div className="name-hero__scene" aria-hidden="true">
          <div className="name-hero__scene-inner">
            <div className="name-hero__hello" ref={helloRef} />
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

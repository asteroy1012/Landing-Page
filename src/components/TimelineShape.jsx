import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { POINT_COUNT, SHAPES, STEP_SHAPES } from '../data/timelineShapes'
import { useReducedMotion } from '../hooks/useReducedMotion'

const COLORS = {
  dark: { ink: '#eef1ec', accent: '#e2984a' },
  light: { ink: '#14170f', accent: '#a85f1c' },
}
const ACCENT_SHARE = 0.12
const VIEW_HEIGHT = 2.1

const MORPH_DURATION = 0.9
const MORPH_STAGGER = 0.35
const REPEL_RADIUS = 0.38
const REPEL_STRENGTH = 0.24
const SHIMMER = 0.006

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function Cloud({ shapeKey, theme, pointer, reducedMotion }) {
  const geomRef = useRef(null)
  const { camera, size, clock, viewport } = useThree()

  // Mutable simulation buffers, created once and updated in place per frame.
  const sim = useMemo(() => {
    const initial = SHAPES[shapeKey]
    return {
      from: new Float32Array(initial),
      to: new Float32Array(initial),
      base: new Float32Array(initial),
      positions: new Float32Array(initial),
      offset: new Float32Array(POINT_COUNT * 3),
      colors: new Float32Array(POINT_COUNT * 3),
      delay: Float32Array.from({ length: POINT_COUNT }, () => Math.random() * MORPH_STAGGER),
      phase: Float32Array.from({ length: POINT_COUNT }, () => Math.random() * Math.PI * 2),
      accent: Uint8Array.from({ length: POINT_COUNT }, () => (Math.random() < ACCENT_SHARE ? 1 : 0)),
      start: -Infinity,
    }
    // Only the first shape seeds the buffers; later changes morph from there.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    camera.zoom = size.height / VIEW_HEIGHT
    camera.updateProjectionMatrix()
  }, [camera, size.height])

  useEffect(() => {
    const next = SHAPES[shapeKey]
    if (!next) return
    sim.from.set(sim.base)
    sim.to.set(next)
    sim.start = clock.getElapsedTime()
  }, [shapeKey, sim, clock])

  useEffect(() => {
    const palette = COLORS[theme] ?? COLORS.dark
    const ink = new THREE.Color(palette.ink)
    const accent = new THREE.Color(palette.accent)
    for (let i = 0; i < POINT_COUNT; i++) {
      const c = sim.accent[i] ? accent : ink
      sim.colors[i * 3] = c.r
      sim.colors[i * 3 + 1] = c.g
      sim.colors[i * 3 + 2] = c.b
    }
    if (geomRef.current) geomRef.current.attributes.color.needsUpdate = true
  }, [theme, sim])

  useFrame((_, dt) => {
    const geom = geomRef.current
    if (!geom) return
    const t = clock.getElapsedTime()
    const { from, to, base, positions, offset, delay, phase } = sim
    const p = pointer.current
    const ease = 1 - Math.exp(-dt * 9)
    const shimmer = reducedMotion ? 0 : SHIMMER

    for (let i = 0; i < POINT_COUNT; i++) {
      const j = i * 3
      const raw = reducedMotion ? 1 : Math.min(1, Math.max(0, (t - sim.start - delay[i]) / MORPH_DURATION))
      const k = easeInOutCubic(raw)
      base[j] = from[j] + (to[j] - from[j]) * k
      base[j + 1] = from[j + 1] + (to[j + 1] - from[j + 1]) * k
      base[j + 2] = from[j + 2] + (to[j + 2] - from[j + 2]) * k

      // Push points away from the pointer, easing back once it moves off.
      let tx = 0
      let ty = 0
      if (p) {
        const dx = base[j] - p.x
        const dy = base[j + 1] - p.y
        const d = Math.hypot(dx, dy)
        if (d < REPEL_RADIUS && d > 1e-4) {
          const force = (1 - d / REPEL_RADIUS) ** 2 * REPEL_STRENGTH
          tx = (dx / d) * force
          ty = (dy / d) * force
        }
      }
      offset[j] += (tx - offset[j]) * ease
      offset[j + 1] += (ty - offset[j + 1]) * ease

      positions[j] = base[j] + offset[j] + Math.sin(t * 1.4 + phase[i]) * shimmer
      positions[j + 1] = base[j + 1] + offset[j + 1] + Math.cos(t * 1.1 + phase[i]) * shimmer
      positions[j + 2] = base[j + 2]
    }
    geom.attributes.position.needsUpdate = true
  })

  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" args={[sim.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[sim.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={1.9 * viewport.dpr}
        sizeAttenuation={false}
        transparent
        opacity={0.95}
        depthWrite={false}
      />
    </points>
  )
}

export default function TimelineShape({ step, total, title, theme }) {
  const stageRef = useRef(null)
  const pointer = useRef(null)
  const [visible, setVisible] = useState(false)
  const reducedMotion = useReducedMotion()
  const shapeKey = STEP_SHAPES[step] ?? 'cap'

  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const onPointerMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const zoom = r.height / VIEW_HEIGHT
    pointer.current = {
      x: (e.clientX - r.left - r.width / 2) / zoom,
      y: (r.height / 2 - (e.clientY - r.top)) / zoom,
    }
  }

  return (
    <figure className="timeline-shape">
      <div
        className="timeline-shape__stage"
        ref={stageRef}
        onPointerMove={onPointerMove}
        onPointerLeave={() => {
          pointer.current = null
        }}
        aria-hidden="true"
      >
        <Canvas
          orthographic
          camera={{ position: [0, 0, 5], zoom: 100 }}
          dpr={[1, 2]}
          frameloop={visible ? 'always' : 'never'}
          gl={{ antialias: false, alpha: true }}
        >
          <Cloud shapeKey={shapeKey} theme={theme} pointer={pointer} reducedMotion={reducedMotion} />
        </Canvas>
      </div>
      <figcaption className="timeline-shape__caption">
        <span>
          {step} / {String(total).padStart(2, '0')}
        </span>
        {title}
      </figcaption>
    </figure>
  )
}

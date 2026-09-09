import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, QuadraticBezierLine, Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { COL_X, GRAPH_NODES, GRAPH_EDGES } from '../data/content'
import { useReducedMotion } from '../hooks/useReducedMotion'

const EDGE_COLOR = '#333c2d'

const nodeById = Object.fromEntries(GRAPH_NODES.map((n) => [n.id, n]))

function nodePosition(node) {
  return [COL_X[node.col], node.y, node.z]
}

// Studio-style lighting rig baked into an environment map purely from
// in-scene shapes (no external HDR fetch) — this is what gives the glossy
// clearcoat spheres their specular highlights and colored reflections.
function StudioEnvironment() {
  return (
    <Environment resolution={256}>
      <group>
        <Lightformer form="rect" intensity={2.2} color="#f4ede0" position={[0, 6, -4]} scale={[14, 5, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#e2984a" position={[-9, -1, 5]} scale={[7, 7, 1]} rotation={[0, Math.PI / 3, 0]} />
        <Lightformer form="rect" intensity={1.1} color="#5b8def" position={[9, 3, 5]} scale={[7, 7, 1]} rotation={[0, -Math.PI / 3, 0]} />
        <Lightformer form="ring" intensity={0.8} color="#ffffff" position={[3, -6, 3]} scale={4} />
      </group>
    </Environment>
  )
}

function Node({ node }) {
  const isHub = node.kind === 'hub'
  return (
    <mesh position={nodePosition(node)} scale={node.size}>
      <sphereGeometry args={[1, 48, 48]} />
      <meshPhysicalMaterial
        color={node.color}
        emissive={node.color}
        emissiveIntensity={isHub ? 0.32 : 0.16}
        metalness={isHub ? 0.3 : 0.15}
        roughness={isHub ? 0.24 : 0.3}
        clearcoat={1}
        clearcoatRoughness={0.15}
        envMapIntensity={1.4}
      />
    </mesh>
  )
}

function EdgeParticles({ curve, color, reducedMotion }) {
  const p0 = useRef(null)
  const p1 = useRef(null)

  useFrame((state) => {
    const speed = reducedMotion ? 0.02 : 0.07
    const elapsed = state.clock.getElapsedTime()
    ;[p0, p1].forEach((ref, i) => {
      if (!ref.current) return
      const t = (elapsed * speed + i / 2) % 1
      curve.getPointAt(t, ref.current.position)
      ref.current.material.opacity = 0.4 + 0.55 * Math.sin(t * Math.PI)
    })
  })

  return (
    <>
      {[p0, p1].map((ref, i) => (
        <mesh ref={ref} key={i}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      ))}
    </>
  )
}

function Edge({ from, to, reducedMotion }) {
  const start = useMemo(() => new THREE.Vector3(...nodePosition(nodeById[from])), [from])
  const end = useMemo(() => new THREE.Vector3(...nodePosition(nodeById[to])), [to])
  const mid = useMemo(
    () => new THREE.Vector3((start.x + end.x) / 2, (start.y + end.y) / 2 + 0.5, (start.z + end.z) / 2),
    [start, end],
  )
  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(start, mid, end), [start, mid, end])
  // Particles carry the color of the node they originate from, so the
  // graph visually reads as each system's data flowing toward Skills.
  const particleColor = nodeById[from].color

  return (
    <>
      <QuadraticBezierLine start={start} end={end} mid={mid} color={EDGE_COLOR} transparent opacity={0.5} lineWidth={1} />
      <EdgeParticles curve={curve} color={particleColor} reducedMotion={reducedMotion} />
    </>
  )
}

export default function LineageGraph() {
  const controlsRef = useRef(null)
  const reducedMotion = useReducedMotion()

  const handleStart = () => {
    if (controlsRef.current) controlsRef.current.autoRotate = false
  }
  const handleEnd = () => {
    if (controlsRef.current) {
      setTimeout(() => {
        if (controlsRef.current) controlsRef.current.autoRotate = true
      }, 1800)
    }
  }

  return (
    <>
      <hemisphereLight args={['#6b7568', '#0a0b08', 0.8]} />
      <directionalLight position={[6, 10, 8]} intensity={0.4} />
      <StudioEnvironment />

      {GRAPH_NODES.map((node) => (
        <Node key={node.id} node={node} />
      ))}
      {GRAPH_EDGES.map(([from, to]) => (
        <Edge key={`${from}-${to}`} from={from} to={to} reducedMotion={reducedMotion} />
      ))}

      <OrbitControls
        ref={controlsRef}
        target={[3.3, 0, 0]}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={0.6}
        maxPolarAngle={2.0}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.55}
        onStart={handleStart}
        onEnd={handleEnd}
      />
    </>
  )
}

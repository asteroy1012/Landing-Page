import { Canvas } from '@react-three/fiber'
import LineageGraph from './LineageGraph'
import TypeTitle from './TypeTitle'

const BG = { dark: '#0b0d0a', light: '#e9ece7' }

export default function Hero({ heroRef, theme }) {
  return (
    <section className="hero" id="heroSection" ref={heroRef}>
      <Canvas camera={{ position: [-2, 5.7, 14.5], fov: 42 }} dpr={[1, 2]} gl={{ antialias: true }}>
        <color attach="background" args={[BG[theme] ?? BG.dark]} />
        <LineageGraph theme={theme} />
      </Canvas>
      <div className="hero-scrim" />
      <p className="hero-kicker">
        From <b>source</b> to <b>target</b>: I <b>trace</b>, <b>reconcile</b>, and <b>govern</b> the data behind
        global banking systems.
      </p>
      <TypeTitle as="h1" className="hero-title" lines={['Data Lineage', 'Analyst.']} />
      <div className="scroll-cue">
        Scroll to explore <span>↓</span>
      </div>
    </section>
  )
}

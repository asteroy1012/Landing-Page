import { Canvas } from '@react-three/fiber'
import LineageGraph from './LineageGraph'

export default function Hero({ heroRef }) {
  return (
    <section className="hero" id="heroSection" ref={heroRef}>
      <Canvas
        camera={{ position: [-2, 5.7, 14.5], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        onCreated={({ gl }) => gl.setClearColor('#0b0d0a', 1)}
      >
        <LineageGraph />
      </Canvas>
      <div className="hero-scrim" />
      <p className="hero-kicker">
        From <b>source</b> to <b>target</b>: I <b>trace</b>, <b>reconcile</b>, and <b>govern</b> the data behind
        global banking systems.
      </p>
      <h1 className="hero-title">
        Data Lineage
        <br />
        Analyst.
      </h1>
      <div className="scroll-cue">
        Scroll to explore <span>↓</span>
      </div>
    </section>
  )
}

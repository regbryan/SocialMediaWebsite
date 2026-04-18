"use client";

import LightRays from "./LightRays";
import ParticleMorph from "./ParticleMorph";

const words = ["VIRAL", "GROWTH", "REACH", "LOYALTY", "IMPACT"];

export default function HeroVideo() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingRight: "clamp(24px, 6vw, 120px)",
      }}
    >
      {/* WebGL light rays — interactive, cursor-tracking */}
      <LightRays
        raysOrigin="top-center"
        raysColor="#8b5cff"
        raysSpeed={1.1}
        lightSpread={0.9}
        rayLength={1.6}
        followMouse
        mouseInfluence={0.12}
        noiseAmount={0.04}
        distortion={0.04}
      />

      {/* Subtle grid */}
      <div className="hero-grid-overlay" />

      {/* Particle morph canvas — heart ↔ word loop */}
      <div style={{ position: "relative", zIndex: 3, textAlign: "center", width: "min(560px, 48vw)" }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.3em",
            color: "rgba(180, 180, 200, 0.7)",
            marginBottom: 16,
            textTransform: "uppercase",
          }}
        >
          Content that drives
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            filter: "drop-shadow(0 4px 30px rgba(236, 72, 153, 0.28))",
          }}
        >
          <ParticleMorph
            words={words}
            width={560}
            height={200}
            holdMs={2200}
            morphMs={1400}
            particleSize={2.4}
            particleCount={1500}
          />
        </div>

        <div
          style={{
            fontSize: 18,
            fontWeight: 500,
            color: "rgba(220, 220, 240, 0.8)",
            marginTop: 16,
          }}
        >
          at the speed of social
        </div>
      </div>

      <style>{`
        .hero-grid-overlay {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse 60% 60% at center, black 20%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse 60% 60% at center, black 20%, transparent 80%);
          pointer-events: none;
          z-index: 2;
        }
      `}</style>
    </div>
  );
}

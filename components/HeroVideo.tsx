"use client";

import { useEffect, useState } from "react";
import LightRays from "./LightRays";

const words = ["VIRAL", "GROWTH", "REACH", "VIEWS", "LOYALTY", "IMPACT"];
const HOLD_MS = 2000;
const MORPH_MS = 900;

type MorphState = {
  curr: string;
  prev: string | null;
};

const wordStyle: React.CSSProperties = {
  position: "absolute",
  fontSize: "clamp(56px, 9vw, 108px)",
  fontWeight: 900,
  letterSpacing: "-0.03em",
  lineHeight: 1,
  background: "linear-gradient(135deg, #c084fc 0%, #8b5cff 35%, #3b81ff 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  whiteSpace: "nowrap",
  willChange: "transform, filter, opacity",
};

export default function HeroVideo() {
  const [state, setState] = useState<MorphState>({ curr: words[0], prev: null });

  useEffect(() => {
    let idx = 0;
    let holdTimer: ReturnType<typeof setTimeout>;
    let clearPrevTimer: ReturnType<typeof setTimeout>;

    const startMorph = () => {
      idx = (idx + 1) % words.length;
      setState((s) => ({ curr: words[idx], prev: s.curr }));
      clearPrevTimer = setTimeout(() => {
        setState((s) => ({ curr: s.curr, prev: null }));
        holdTimer = setTimeout(startMorph, HOLD_MS);
      }, MORPH_MS);
    };

    holdTimer = setTimeout(startMorph, HOLD_MS);
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(clearPrevTimer);
    };
  }, []);

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

      {/* Kinetic typography — pushed to the right */}
      <div style={{ position: "relative", zIndex: 3, textAlign: "center", width: "min(520px, 45vw)" }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.3em",
            color: "rgba(180, 180, 200, 0.7)",
            marginBottom: 18,
            textTransform: "uppercase",
          }}
        >
          Content that drives
        </div>

        <div
          style={{
            position: "relative",
            height: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            filter: "drop-shadow(0 4px 24px rgba(139, 92, 255, 0.35))",
          }}
        >
          {state.prev && (
            <div key={`out-${state.prev}`} className="morph-exit" style={wordStyle}>
              {state.prev}
            </div>
          )}
          <div key={`in-${state.curr}`} className="morph-enter" style={wordStyle}>
            {state.curr}
          </div>
        </div>

        <div
          style={{
            fontSize: 18,
            fontWeight: 500,
            color: "rgba(220, 220, 240, 0.8)",
            marginTop: 22,
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

        .morph-enter {
          animation: morphIn ${MORPH_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .morph-exit {
          animation: morphOut ${MORPH_MS}ms cubic-bezier(0.55, 0, 0.8, 0.2) both;
        }
        @keyframes morphIn {
          0% {
            opacity: 0;
            filter: blur(36px);
            transform: scale(0.82);
            letter-spacing: 0.3em;
          }
          60% {
            opacity: 1;
            filter: blur(2px);
            transform: scale(1.02);
            letter-spacing: -0.02em;
          }
          100% {
            opacity: 1;
            filter: blur(0);
            transform: scale(1);
            letter-spacing: -0.03em;
          }
        }
        @keyframes morphOut {
          0% {
            opacity: 1;
            filter: blur(0);
            transform: scale(1);
            letter-spacing: -0.03em;
          }
          100% {
            opacity: 0;
            filter: blur(36px);
            transform: scale(1.25);
            letter-spacing: 0.2em;
          }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

const words = ["VIRAL", "GROWTH", "REACH", "VIEWS", "LOYALTY", "IMPACT"];
const WORD_DURATION_MS = 2200;

export default function HeroVideo() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % words.length), WORD_DURATION_MS);
    return () => clearInterval(id);
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
      {/* Flowing gradient blobs */}
      <div className="blob blob-a" />
      <div className="blob blob-b" />
      <div className="blob blob-c" />

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
          }}
        >
          {words.map((word, i) => (
            <div
              key={word}
              className={i === idx ? "kinetic-word active" : "kinetic-word"}
              style={{
                position: "absolute",
                fontSize: "clamp(64px, 10vw, 120px)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 1,
                background: "linear-gradient(135deg, #c084fc 0%, #8b5cff 35%, #3b81ff 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 4px 30px rgba(139, 92, 255, 0.35))",
                whiteSpace: "nowrap",
              }}
            >
              {word}
            </div>
          ))}
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

        {/* Orbiting dots */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 500, height: 500, pointerEvents: "none", zIndex: -1 }}>
          <div className="orbit-dot orbit-a" />
          <div className="orbit-dot orbit-b" />
          <div className="orbit-dot orbit-c" />
        </div>
      </div>

      <style>{`
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 1;
          mix-blend-mode: screen;
        }
        .blob-a {
          width: 360px; height: 360px;
          background: radial-gradient(circle, rgba(139,92,255,0.55) 0%, transparent 70%);
          top: 10%; left: 15%;
          animation: floatA 14s ease-in-out infinite;
        }
        .blob-b {
          width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(59,129,255,0.45) 0%, transparent 70%);
          bottom: 5%; right: 10%;
          animation: floatB 18s ease-in-out infinite;
        }
        .blob-c {
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(236,72,153,0.4) 0%, transparent 70%);
          top: 50%; left: 55%;
          animation: floatC 16s ease-in-out infinite;
        }

        @keyframes floatA {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(60px, -40px) scale(1.15); }
          66% { transform: translate(-30px, 50px) scale(0.9); }
        }
        @keyframes floatB {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-80px, -30px) scale(1.2); }
        }
        @keyframes floatC {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(40px, 60px) scale(0.8); }
          70% { transform: translate(-50px, -40px) scale(1.1); }
        }

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

        .kinetic-word {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: opacity, transform;
        }
        .kinetic-word.active {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .orbit-dot {
          position: absolute;
          width: 10px; height: 10px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 0 20px rgba(139, 92, 255, 0.8);
        }
        .orbit-a {
          top: 10%; left: 50%;
          animation: orbit 10s linear infinite;
          transform-origin: 0 200px;
        }
        .orbit-b {
          bottom: 10%; left: 50%;
          animation: orbit 14s linear infinite reverse;
          transform-origin: 0 -200px;
          background: #c084fc;
        }
        .orbit-c {
          top: 50%; left: 10%;
          animation: orbit 12s linear infinite;
          transform-origin: 200px 0;
          background: #3b81ff;
          width: 6px; height: 6px;
        }
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

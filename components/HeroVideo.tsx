"use client";

import { useEffect, useRef } from "react";

const words = ["VIRAL", "GROWTH", "REACH", "VIEWS", "LOYALTY", "IMPACT"];
const WORD_HOLD_MS = 1800;
const TRANSITION_MS = 1400;
const CANVAS_W = 600;
const CANVAS_H = 160;
const FONT_SIZE = 96;
const SAMPLE_STEP = 2;
const PARTICLE_SIZE = 3;
const ROLL_OFFSET_X = 520; // distance particles drift off to the right

type Particle = {
  x: number;
  y: number;
  phase: number;
  amp: number;
  entryOffsetY: number;
  entryOffsetX: number;
};

function sampleText(text: string): Particle[] {
  const c = document.createElement("canvas");
  c.width = CANVAS_W;
  c.height = CANVAS_H;
  const ctx = c.getContext("2d");
  if (!ctx) return [];

  ctx.fillStyle = "white";
  ctx.strokeStyle = "white";
  ctx.lineWidth = 6;
  ctx.lineJoin = "round";
  ctx.font = `900 ${FONT_SIZE}px Arial, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeText(text, CANVAS_W / 2, CANVAS_H / 2);
  ctx.fillText(text, CANVAS_W / 2, CANVAS_H / 2);

  const data = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H).data;
  const pts: Particle[] = [];
  for (let y = 0; y < CANVAS_H; y += SAMPLE_STEP) {
    for (let x = 0; x < CANVAS_W; x += SAMPLE_STEP) {
      if (data[(y * CANVAS_W + x) * 4 + 3] > 128) {
        pts.push({
          x,
          y,
          phase: Math.random() * Math.PI * 2,
          amp: 0.5 + Math.random() * 1.8,
          entryOffsetY: (Math.random() - 0.5) * 90,
          entryOffsetX: 80 + Math.random() * 180,
        });
      }
    }
  }
  return pts;
}

function smoothstep(t: number) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

function hueForParticle(p: Particle): number {
  // Gradient: left purple → right blue, matching the brand gradient
  const t = p.x / CANVAS_W;
  return 280 - t * 60; // 280 (violet) to 220 (azure)
}

export default function HeroVideo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    ctx.scale(dpr, dpr);

    const state = {
      wordIdx: 0,
      entering: sampleText(words[0]),
      exiting: [] as Particle[],
      isTransitioning: false,
      transitionStart: 0,
      nextTransitionAt: performance.now() + WORD_HOLD_MS,
    };

    let rafId = 0;
    const loop = (now: number) => {
      // Trigger next transition
      if (!state.isTransitioning && now >= state.nextTransitionAt) {
        state.isTransitioning = true;
        state.transitionStart = now;
        state.exiting = state.entering;
        const nextIdx = (state.wordIdx + 1) % words.length;
        state.entering = sampleText(words[nextIdx]);
        state.wordIdx = nextIdx;
      }

      let progress = 1;
      if (state.isTransitioning) {
        progress = Math.min(1, (now - state.transitionStart) / TRANSITION_MS);
        if (progress >= 1) {
          state.isTransitioning = false;
          state.exiting = [];
          state.nextTransitionAt = now + WORD_HOLD_MS;
        }
      }

      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // Exiting: dissolve and sweep right
      if (state.exiting.length && progress < 1) {
        const eased = smoothstep(progress);
        for (const p of state.exiting) {
          const wobbleX = Math.sin(now / 120 + p.phase) * p.amp * eased * 12;
          const wobbleY = Math.sin(now / 180 + p.phase) * p.amp * eased * 10;
          const x = p.x + eased * (ROLL_OFFSET_X + p.entryOffsetX) + wobbleX;
          const y = p.y + wobbleY;
          const alpha = 1 - eased;
          const hue = hueForParticle(p);
          ctx.fillStyle = `hsla(${hue}, 85%, 68%, ${alpha})`;
          ctx.fillRect(x, y, PARTICLE_SIZE, PARTICLE_SIZE);
        }
      }

      // Entering: stream in from the right and reform
      if (progress < 1) {
        const eased = smoothstep(progress);
        for (const p of state.entering) {
          const startX = CANVAS_W + p.entryOffsetX;
          const startY = p.y + p.entryOffsetY;
          const wobbleX = Math.sin(now / 120 + p.phase) * p.amp * (1 - eased) * 12;
          const wobbleY = Math.sin(now / 180 + p.phase) * p.amp * (1 - eased) * 10;
          const x = startX + eased * (p.x - startX) + wobbleX;
          const y = startY + eased * (p.y - startY) + wobbleY;
          const alpha = eased;
          const hue = hueForParticle(p);
          ctx.fillStyle = `hsla(${hue}, 85%, 68%, ${alpha})`;
          ctx.fillRect(x, y, PARTICLE_SIZE, PARTICLE_SIZE);
        }
      } else {
        // Locked: subtle breathing noise
        for (const p of state.entering) {
          const x = p.x + Math.sin(now / 500 + p.phase) * p.amp * 0.7;
          const y = p.y + Math.cos(now / 600 + p.phase) * p.amp * 0.7;
          const hue = hueForParticle(p);
          ctx.fillStyle = `hsl(${hue}, 85%, 68%)`;
          ctx.fillRect(x, y, PARTICLE_SIZE, PARTICLE_SIZE);
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
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
      <div style={{ position: "relative", zIndex: 3, textAlign: "center", width: "min(600px, 48vw)" }}>
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            filter: "drop-shadow(0 4px 24px rgba(139, 92, 255, 0.35))",
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: `${CANVAS_W}px`,
              height: `${CANVAS_H}px`,
              maxWidth: "100%",
            }}
          />
        </div>

        <div
          style={{
            fontSize: 18,
            fontWeight: 500,
            color: "rgba(220, 220, 240, 0.8)",
            marginTop: 10,
          }}
        >
          at the speed of social
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
      `}</style>
    </div>
  );
}

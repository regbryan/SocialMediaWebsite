"use client";

import { useEffect, useRef } from "react";

/**
 * DOM-based particle morph using CSS transforms.
 *
 * Full sequence per cycle:
 *   1. HEART holds (stable shape)
 *   2. WIND STREAK — particles kick horizontally, heavy motion blur
 *   3. TEXT — decelerate + spring into letter positions
 *   4. TEXT holds
 *   5. BALL SWEEP — compact cluster sweeps left→right, "eating" the text
 *   6. BALL reforms into HEART (loop)
 */

type Props = {
  words: string[];
  width?: number;
  height?: number;
  particleCount?: number;
};

type Pt = { x: number; y: number };
type Particle = {
  el: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  captured: boolean; // true when the sweep ball has eaten this particle
  phase: number;
};

function samplePointsFromDraw(
  w: number,
  h: number,
  step: number,
  draw: (ctx: CanvasRenderingContext2D) => void
): Pt[] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return [];
  draw(ctx);
  const data = ctx.getImageData(0, 0, w, h).data;
  const pts: Pt[] = [];
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (data[(y * w + x) * 4 + 3] > 128) pts.push({ x, y });
    }
  }
  return pts;
}

function heartPoints(w: number, h: number): Pt[] {
  return samplePointsFromDraw(w, h, 4, (c) => {
    const cx = w / 2;
    const cy = h / 2 + 10;
    const s = Math.min(w, h) * 0.38;
    c.fillStyle = "white";
    c.beginPath();
    c.moveTo(cx, cy + s * 0.35);
    c.bezierCurveTo(cx - s * 1.35, cy - s * 0.45, cx - s * 0.55, cy - s * 1.25, cx, cy - s * 0.3);
    c.bezierCurveTo(cx + s * 0.55, cy - s * 1.25, cx + s * 1.35, cy - s * 0.45, cx, cy + s * 0.35);
    c.closePath();
    c.fill();
  });
}

function textPoints(w: number, h: number, text: string): Pt[] {
  return samplePointsFromDraw(w, h, 4, (c) => {
    c.fillStyle = "white";
    c.strokeStyle = "white";
    c.lineWidth = 6;
    c.lineJoin = "round";
    const fontSize = Math.min(w / (text.length * 0.58), h * 0.78);
    c.font = `900 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.strokeText(text, w / 2, h / 2);
    c.fillText(text, w / 2, h / 2);
  });
}

function resampleTo(pts: Pt[], n: number): Pt[] {
  if (pts.length === 0) return new Array(n).fill({ x: 0, y: 0 });
  const out = new Array(n);
  for (let i = 0; i < n; i++) out[i] = pts[Math.floor((i / n) * pts.length)];
  // Light shuffle so particle identity isn't correlated with x
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Phase durations (ms) — cycle totals to ~7s per word
const T = {
  heartHold: 1600,
  toStreak: 250,
  streakToText: 950,
  textHold: 1500,
  ballSweep: 1700,
  ballToHeart: 900,
};

type Phase = "heartHold" | "toStreak" | "streakToText" | "textHold" | "ballSweep" | "ballToHeart";

export default function ParticleMorph({
  words,
  width = 560,
  height = 200,
  particleCount = 500,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    // --- Build shape targets ---
    const heart = resampleTo(heartPoints(width, height), particleCount);
    const texts = words.map((w) => resampleTo(textPoints(width, height, w), particleCount));

    // --- Create particle elements ---
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const el = document.createElement("div");
      el.className = "pm-particle";
      wrap.appendChild(el);
      const start = heart[i];
      particles.push({
        el,
        x: start.x,
        y: start.y,
        vx: 0,
        vy: 0,
        tx: start.x,
        ty: start.y,
        captured: false,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // --- State machine ---
    let wordIdx = 0;
    let phase: Phase = "heartHold";
    let phaseStart = performance.now();
    // Ball sweep state
    let ballX = -40;
    let ballY = height / 2;

    const setTargetsFromArray = (arr: Pt[]) => {
      for (let i = 0; i < particles.length; i++) {
        particles[i].tx = arr[i].x;
        particles[i].ty = arr[i].y;
      }
    };

    const kickStreak = () => {
      // All particles get a strong rightward velocity + small vertical jitter
      for (const p of particles) {
        p.vx = 18 + Math.random() * 10;
        p.vy = (Math.random() - 0.5) * 3;
      }
    };

    let rafId = 0;
    const loop = (now: number) => {
      const elapsed = now - phaseStart;
      const target = T[phase];

      // --- Phase transitions ---
      if (elapsed >= target) {
        phaseStart = now;
        if (phase === "heartHold") {
          phase = "toStreak";
          kickStreak();
        } else if (phase === "toStreak") {
          phase = "streakToText";
          setTargetsFromArray(texts[wordIdx]);
        } else if (phase === "streakToText") {
          phase = "textHold";
        } else if (phase === "textHold") {
          phase = "ballSweep";
          ballX = -60;
          ballY = height / 2;
          for (const p of particles) p.captured = false;
        } else if (phase === "ballSweep") {
          phase = "ballToHeart";
          setTargetsFromArray(heart);
          for (const p of particles) p.captured = false;
        } else {
          phase = "heartHold";
          wordIdx = (wordIdx + 1) % words.length;
        }
      }

      // --- Per-frame updates ---
      let filterStr = "";
      if (phase === "toStreak") {
        // Free-flight with blur trail
        const t = elapsed / T.toStreak;
        filterStr = `blur(${3 + t * 5}px)`;
        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy *= 0.97;
        }
      } else if (phase === "streakToText") {
        const t = elapsed / T.streakToText;
        filterStr = `blur(${Math.max(0, 6 - t * 8)}px)`;
        for (const p of particles) {
          const ax = (p.tx - p.x) * 0.055;
          const ay = (p.ty - p.y) * 0.055;
          p.vx = (p.vx + ax) * 0.82;
          p.vy = (p.vy + ay) * 0.82;
          p.x += p.vx;
          p.y += p.vy;
        }
      } else if (phase === "heartHold" || phase === "textHold") {
        // Gentle settle + wobble
        for (const p of particles) {
          const ax = (p.tx - p.x) * 0.08;
          const ay = (p.ty - p.y) * 0.08;
          p.vx = (p.vx + ax) * 0.82;
          p.vy = (p.vy + ay) * 0.82;
          p.vx += Math.sin(now * 0.001 + p.phase) * 0.04;
          p.vy += Math.cos(now * 0.0012 + p.phase) * 0.04;
          p.x += p.vx;
          p.y += p.vy;
        }
      } else if (phase === "ballSweep") {
        // Ball position eases left → right across the full width
        const t = elapsed / T.ballSweep;
        const ease = t * t * (3 - 2 * t);
        ballX = -60 + (width + 120) * ease;
        ballY = height / 2 + Math.sin(t * Math.PI * 2) * 8;

        for (const p of particles) {
          if (!p.captured && p.tx < ballX + 30) {
            p.captured = true;
          }
          if (p.captured) {
            // Particle is pulled to ball center + follows with slight trail
            const dx = ballX - p.x;
            const dy = ballY - p.y;
            p.vx = (p.vx + dx * 0.08) * 0.82;
            p.vy = (p.vy + dy * 0.08) * 0.82;
            p.x += p.vx;
            p.y += p.vy;
          } else {
            // Stay at text position with gentle idle
            const ax = (p.tx - p.x) * 0.18;
            const ay = (p.ty - p.y) * 0.18;
            p.vx = (p.vx + ax) * 0.7;
            p.vy = (p.vy + ay) * 0.7;
            p.x += p.vx;
            p.y += p.vy;
          }
        }
      } else if (phase === "ballToHeart") {
        // All particles travel to their heart target
        const t = elapsed / T.ballToHeart;
        filterStr = `blur(${Math.max(0, 4 - t * 6)}px)`;
        for (const p of particles) {
          const ax = (p.tx - p.x) * 0.08;
          const ay = (p.ty - p.y) * 0.08;
          p.vx = (p.vx + ax) * 0.85;
          p.vy = (p.vy + ay) * 0.85;
          p.x += p.vx;
          p.y += p.vy;
        }
      }

      // Apply wrapper filter for the streak blur phases
      wrap.style.filter = filterStr || "";

      // Write transforms (batch, one style.transform per frame)
      for (const p of particles) {
        // Brightness from speed — faster = brighter trail look
        const speed = Math.min(Math.hypot(p.vx, p.vy), 28);
        const scaleX = phase === "toStreak" ? 1 + speed * 0.35 : 1;
        p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) scaleX(${scaleX})`;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      for (const p of particles) p.el.remove();
    };
  }, [words, width, height, particleCount]);

  return (
    <div
      ref={wrapRef}
      className="pm-wrap"
      style={{
        position: "relative",
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: "100%",
      }}
    >
      <style>{`
        .pm-wrap { transition: filter 0.1s linear; }
        .pm-particle {
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: #ff3377;
          box-shadow:
            0 0 4px rgba(255, 51, 119, 0.85),
            0 0 10px rgba(255, 20, 90, 0.55);
          mix-blend-mode: screen;
          pointer-events: none;
          will-change: transform;
          transform-origin: center center;
        }
      `}</style>
    </div>
  );
}

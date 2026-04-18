"use client";

import { useEffect, useRef } from "react";

/**
 * Particle morph canvas — samples pixel positions from shapes (heart, text),
 * then animates particles between them with motion trails.
 *
 * Loop: heart → word[0] → heart → word[1] → heart → word[2] → ...
 */

type Props = {
  words: string[];
  width?: number;
  height?: number;
  holdMs?: number;
  morphMs?: number;
  particleSize?: number;
  /** Target number of particles — actual count may vary slightly */
  particleCount?: number;
};

type Particle = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  phase: number;
  amp: number;
  /** Hue 0-360 for gradient color */
  hue: number;
};

function hashPick<T>(arr: T[], seed: number): T {
  // Deterministic pick by index (so particles keep personality across remaps)
  return arr[seed % arr.length];
}

/** Sample opaque pixel positions from a rasterized shape. */
function samplePoints(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
  step: number
): { x: number; y: number }[] {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d");
  if (!ctx) return [];
  draw(ctx);
  const data = ctx.getImageData(0, 0, width, height).data;
  const pts: { x: number; y: number }[] = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (data[(y * width + x) * 4 + 3] > 128) pts.push({ x, y });
    }
  }
  return pts;
}

/** Resample an array of points to a target count (uniform sample/duplicate). */
function normalizeToCount(pts: { x: number; y: number }[], n: number) {
  if (pts.length === 0) return new Array(n).fill({ x: 0, y: 0 });
  if (pts.length === n) return pts;
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = pts[Math.floor((i / n) * pts.length)];
  }
  // Shuffle to randomize which particle claims which target (looks more organic)
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function ParticleMorph({
  words,
  width = 600,
  height = 200,
  holdMs = 2200,
  morphMs = 1200,
  particleSize = 2.2,
  particleCount = 1400,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // --- Build target point sets (heart + each word) ---
    const SAMPLE_STEP = 3;

    const heartPoints = samplePoints(
      width,
      height,
      (c) => {
        const cx = width / 2;
        const cy = height / 2 + 8;
        const s = Math.min(width, height) * 0.38;
        c.fillStyle = "white";
        c.beginPath();
        c.moveTo(cx, cy + s * 0.35);
        c.bezierCurveTo(cx - s * 1.35, cy - s * 0.45, cx - s * 0.55, cy - s * 1.25, cx, cy - s * 0.3);
        c.bezierCurveTo(cx + s * 0.55, cy - s * 1.25, cx + s * 1.35, cy - s * 0.45, cx, cy + s * 0.35);
        c.closePath();
        c.fill();
      },
      SAMPLE_STEP
    );

    const wordPointSets = words.map((word) =>
      samplePoints(
        width,
        height,
        (c) => {
          c.fillStyle = "white";
          c.strokeStyle = "white";
          c.lineWidth = 6;
          c.lineJoin = "round";
          const fontSize = Math.min(width / (word.length * 0.6), height * 0.75);
          c.font = `900 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.strokeText(word, width / 2, height / 2);
          c.fillText(word, width / 2, height / 2);
        },
        SAMPLE_STEP
      )
    );

    // Target sequence: heart, word0, heart, word1, heart, ...
    const targets: { x: number; y: number }[][] = [];
    for (let i = 0; i < words.length; i++) {
      targets.push(normalizeToCount(heartPoints, particleCount));
      targets.push(normalizeToCount(wordPointSets[i], particleCount));
    }

    // --- Initialize particles at first target ---
    const particles: Particle[] = new Array(particleCount).fill(null).map((_, i) => {
      const start = hashPick(targets[0], i);
      // Slightly scatter initial positions for a soft fade-in
      return {
        x: start.x + (Math.random() - 0.5) * 40,
        y: start.y + (Math.random() - 0.5) * 40,
        tx: start.x,
        ty: start.y,
        vx: 0,
        vy: 0,
        phase: Math.random() * Math.PI * 2,
        amp: 0.6 + Math.random() * 1.6,
        hue: 310 + Math.random() * 40, // magenta → pink → purple spectrum
      };
    });

    // --- Animation loop ---
    let stateIdx = 0;
    let lastSwitch = performance.now();
    let rafId = 0;

    const setTargets = (targetPts: { x: number; y: number }[]) => {
      for (let i = 0; i < particles.length; i++) {
        const t = targetPts[i];
        particles[i].tx = t.x;
        particles[i].ty = t.y;
      }
    };

    const loop = (now: number) => {
      const elapsed = now - lastSwitch;
      if (elapsed >= holdMs + morphMs) {
        stateIdx = (stateIdx + 1) % targets.length;
        setTargets(targets[stateIdx]);
        lastSwitch = now;
      }

      // Motion trails — erase alpha channel slightly each frame so old particles fade
      // without filling with a background color (keeps the canvas transparent).
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Spring toward target with friction
        const ax = (p.tx - p.x) * 0.06;
        const ay = (p.ty - p.y) * 0.06;
        p.vx = (p.vx + ax) * 0.86;
        p.vy = (p.vy + ay) * 0.86;

        // Small organic wobble
        p.vx += Math.sin(now * 0.001 + p.phase) * p.amp * 0.03;
        p.vy += Math.cos(now * 0.0012 + p.phase) * p.amp * 0.03;

        p.x += p.vx;
        p.y += p.vy;

        // Particle color: HSL with hue from particle
        const speed = Math.min(Math.hypot(p.vx, p.vy) / 3, 1);
        const lightness = 60 + speed * 15;
        ctx.fillStyle = `hsla(${p.hue}, 90%, ${lightness}%, 0.9)`;
        ctx.fillRect(p.x, p.y, particleSize, particleSize);
      }

      ctx.globalCompositeOperation = "source-over";
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [words, width, height, holdMs, morphMs, particleSize, particleCount]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: "100%",
        display: "block",
      }}
    />
  );
}

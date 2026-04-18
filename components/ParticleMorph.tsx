"use client";

import { useEffect, useRef } from "react";

/**
 * 2D canvas particle morph with "antigravity" physics.
 *
 * Each particle has:
 *   - A "home" target (x, y) from the current shape
 *   - Velocity (vx, vy) with friction — so motion toward target eases in/out
 *     organically instead of lerping in a rigid straight line
 *   - A noise phase + amplitude — every frame a small sin/cos offset is
 *     added to velocity so the particles vibrate / float in place, giving
 *     the "zero gravity" feel (visible even when all particles have
 *     reached their target shape)
 *   - A depth (0–1) used to vary size + alpha — fakes 3D so the shape
 *     has a subtle near/far feeling instead of being perfectly flat
 *
 * Trail effect uses globalCompositeOperation: 'destination-out' so the
 * canvas stays transparent over our WebGL light-rays background.
 */

type Props = {
  words: string[];
  width?: number;
  height?: number;
  particleCount?: number;
  holdMs?: number;
};

type Pt = { x: number; y: number };

export default function ParticleMorph({
  words,
  width = 560,
  height = 200,
  particleCount = 1500,
  holdMs = 3200,
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

    // --- Shape samplers ---
    const sampler = document.createElement("canvas");
    sampler.width = width;
    sampler.height = height;
    const samplerCtx = sampler.getContext("2d");
    if (!samplerCtx) return;

    const heartScale = Math.min(width, height) * 0.42 / 17;
    const getHeartPoints = (): Pt[] => {
      const pts: Pt[] = [];
      for (let i = 0; i < particleCount; i++) {
        const t = Math.random() * Math.PI * 2;
        // random radial jitter inside the heart so particles fill it (not just outline)
        const r = 0.55 + Math.random() * 0.45;
        const x = 16 * Math.pow(Math.sin(t), 3) * r;
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * r;
        pts.push({ x: x * heartScale + width / 2, y: y * heartScale + height / 2 });
      }
      return pts;
    };

    const getTextPoints = (text: string): Pt[] => {
      samplerCtx.clearRect(0, 0, width, height);
      samplerCtx.fillStyle = "white";
      samplerCtx.strokeStyle = "white";
      samplerCtx.lineWidth = 6;
      samplerCtx.lineJoin = "round";
      // 0.72 width-coefficient + 0.55 height-coefficient leaves enough
      // vertical margin for ascenders/descenders so letters aren't clipped.
      const fontSize = Math.min(width / (text.length * 0.72), height * 0.55);
      samplerCtx.font = `900 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
      samplerCtx.textAlign = "center";
      // Use alphabetic + measureTextMetrics-derived offset for reliable vertical centering
      samplerCtx.textBaseline = "alphabetic";
      const metrics = samplerCtx.measureText(text);
      const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.72;
      const descent = metrics.actualBoundingBoxDescent || fontSize * 0.2;
      const visualCenterOffset = (ascent - descent) / 2;
      const y = height / 2 + visualCenterOffset;
      samplerCtx.strokeText(text, width / 2, y);
      samplerCtx.fillText(text, width / 2, y);

      const data = samplerCtx.getImageData(0, 0, width, height).data;
      const pts: Pt[] = [];
      // Step 2 gives ~4× denser sampling than step 3 — crisper letter edges
      for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          if (data[(y * width + x) * 4 + 3] > 128) pts.push({ x, y });
        }
      }
      return pts;
    };

    // --- Particles ---
    type Particle = {
      x: number;
      y: number;
      tx: number;
      ty: number;
      vx: number;
      vy: number;
      size: number;
      depth: number;
      noisePhase: number;
      noiseAmp: number;
    };

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const depth = Math.random();
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 100,
        y: height / 2 + (Math.random() - 0.5) * 40,
        tx: 0,
        ty: 0,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: 0.8 + depth * 1.2, // fake Z depth → bigger for "near" particles
        depth,
        noisePhase: Math.random() * Math.PI * 2,
        noiseAmp: 0.6 + Math.random() * 1.2,
      });
    }

    const morphTo = (targets: Pt[]) => {
      if (targets.length === 0) return;
      // Stride-sample so particles distribute across ALL targets, not just
      // the first N (which previously caused the word to only fill its top
      // row when there were ~10k targets but only 1800 particles).
      const stride = targets.length / particles.length;
      for (let i = 0; i < particles.length; i++) {
        // Add a small jitter so particles don't align on exact integer strides
        const idx = Math.floor(i * stride + Math.random() * stride);
        const t = targets[idx % targets.length];
        particles[i].tx = t.x;
        particles[i].ty = t.y;
      }
    };

    // Initial = heart
    morphTo(getHeartPoints());

    // Cycle: heart → word[0] → heart → word[1] → heart → word[2] ...
    const wordOrder: (() => Pt[])[] = [];
    for (const w of words) {
      wordOrder.push(getHeartPoints);
      wordOrder.push(() => getTextPoints(w));
    }
    let cycleIdx = 0;
    const intervalId = setInterval(() => {
      cycleIdx = (cycleIdx + 1) % wordOrder.length;
      morphTo(wordOrder[cycleIdx]());
    }, holdMs);

    // --- Animation loop ---
    const startTime = performance.now();
    let rafId = 0;
    const draw = () => {
      const now = performance.now();
      const t = (now - startTime) / 1000;

      // Trail fade via alpha erase (keeps canvas transparent)
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      ctx.fillRect(0, 0, width, height);

      // Additive draw for glow-on-glow overlap
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Spring toward target with friction. Higher spring + less friction
        // so particles settle into the word within ~0.6s (was 2s+).
        const ax = (p.tx - p.x) * 0.055;
        const ay = (p.ty - p.y) * 0.055;
        p.vx = (p.vx + ax) * 0.86;
        p.vy = (p.vy + ay) * 0.86;

        // Jitter noise — small, so it vibrates at rest without blurring letters
        p.vx += Math.sin(t * 0.9 + p.noisePhase) * p.noiseAmp * 0.012;
        p.vy += Math.cos(t * 1.1 + p.noisePhase * 1.3) * p.noiseAmp * 0.012;

        p.x += p.vx;
        p.y += p.vy;

        // Color brightness + size modulated by depth for a 3D feel
        const alpha = 0.5 + p.depth * 0.5;
        ctx.fillStyle = `rgba(255, 46, 120, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);

    return () => {
      clearInterval(intervalId);
      cancelAnimationFrame(rafId);
    };
  }, [words, width, height, particleCount, holdMs]);

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

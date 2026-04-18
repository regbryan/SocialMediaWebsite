"use client";

import React, { useEffect, useRef, useState } from "react";

export interface GlowingEdgeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const round = (v: number, p = 3) => parseFloat(v.toFixed(p));
const clamp = (v: number, lo = 0, hi = 100) => Math.min(Math.max(v, lo), hi);

export default function GlowingEdgeCard({ className, children, style, ...props }: GlowingEdgeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const perx = clamp((100 / rect.width) * x);
    const pery = clamp((100 / rect.height) * y);
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;

    let angleDeg = 0;
    if (dx !== 0 || dy !== 0) {
      angleDeg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (angleDeg < 0) angleDeg += 360;
    }

    let k_x = Infinity;
    let k_y = Infinity;
    if (dx !== 0) k_x = cx / Math.abs(dx);
    if (dy !== 0) k_y = cy / Math.abs(dy);
    const edge = clamp(1 / Math.min(k_x, k_y), 0, 1);

    el.style.setProperty("--pointer-x", `${round(perx)}%`);
    el.style.setProperty("--pointer-y", `${round(pery)}%`);
    el.style.setProperty("--pointer-deg", `${round(angleDeg)}deg`);
    el.style.setProperty("--pointer-d", `${round(edge * 100)}`);

    if (isAnimating) {
      setIsAnimating(false);
      el.classList.remove("gec-animating");
    }
  };

  // One-time intro sweep to show the glow on mount
  useEffect(() => {
    const t = setTimeout(() => {
      const el = cardRef.current;
      if (!el) return;
      setIsAnimating(true);
      el.classList.add("gec-animating");
      const angleStart = 110;
      const angleEnd = 465;
      const start = performance.now();
      const duration = 3800;

      const step = (now: number) => {
        if (!el || !el.classList.contains("gec-animating")) return;
        const elapsed = now - start;
        if (elapsed > 400 && elapsed < 900) {
          const t = (elapsed - 400) / 500;
          el.style.setProperty("--pointer-d", `${(1 - Math.pow(1 - t, 3)) * 100}`);
        }
        if (elapsed > 400 && elapsed < 1800) {
          const t = (elapsed - 400) / 1400;
          const d = (angleEnd - angleStart) * (t * t * t * 0.5) + angleStart;
          el.style.setProperty("--pointer-deg", `${d}deg`);
        }
        if (elapsed >= 1800 && elapsed < 3600) {
          const t = (elapsed - 1800) / 1800;
          const d = (angleEnd - angleStart) * (0.5 + (1 - Math.pow(1 - t, 3)) * 0.5) + angleStart;
          el.style.setProperty("--pointer-deg", `${d}deg`);
        }
        if (elapsed > 2600 && elapsed < 3800) {
          const t = (elapsed - 2600) / 1200;
          el.style.setProperty("--pointer-d", `${(1 - t * t * t) * 100}`);
        }
        if (elapsed < duration) requestAnimationFrame(step);
        else {
          setIsAnimating(false);
          el.classList.remove("gec-animating");
        }
      };
      requestAnimationFrame(step);
    }, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={`gec-root group ${className ?? ""}`}
      style={
        {
          position: "relative",
          borderRadius: "20px",
          "--glow-sens": "30",
          "--color-sens": "50",
          "--pointer-x": "50%",
          "--pointer-y": "50%",
          "--pointer-deg": "45deg",
          "--pointer-d": "0",
          "--card-bg": "#0f0f1a",
          "--blend": "soft-light",
          "--glow-blend": "plus-lighter",
          "--glow-color": "270deg 85% 70%",
          "--glow-boost": "0%",
          "--fg": "white",
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      <style>{`
        .gec-root .gec-mesh-border {
          position: absolute; inset: 0; border-radius: inherit; z-index: 0;
          border: 1px solid transparent; pointer-events: none;
          background:
            linear-gradient(var(--card-bg) 0 100%) padding-box,
            linear-gradient(rgb(255 255 255 / 0%) 0% 100%) border-box,
            radial-gradient(at 80% 55%, hsla(268,100%,76%,1) 0, transparent 50%) border-box,
            radial-gradient(at 69% 34%, hsla(349,100%,74%,1) 0, transparent 50%) border-box,
            radial-gradient(at 8% 6%, hsla(136,100%,78%,1) 0, transparent 50%) border-box,
            radial-gradient(at 41% 38%, hsla(192,100%,64%,1) 0, transparent 50%) border-box,
            radial-gradient(at 86% 85%, hsla(186,100%,74%,1) 0, transparent 50%) border-box,
            radial-gradient(at 82% 18%, hsla(52,100%,65%,1) 0, transparent 50%) border-box,
            radial-gradient(at 51% 4%, hsla(12,100%,72%,1) 0, transparent 50%) border-box,
            linear-gradient(#c299ff 0 100%) border-box;
          opacity: calc((var(--pointer-d) - var(--color-sens)) / (100 - var(--color-sens)));
          mask-image: conic-gradient(from var(--pointer-deg) at center, black 25%, transparent 40%, transparent 60%, black 75%);
          -webkit-mask-image: conic-gradient(from var(--pointer-deg) at center, black 25%, transparent 40%, transparent 60%, black 75%);
          transition: opacity 0.25s ease-out;
        }
        .gec-root .gec-glow {
          position: absolute; inset: -28px; pointer-events: none; z-index: 2;
          border-radius: inherit;
          mask-image: conic-gradient(from var(--pointer-deg) at center, black 5%, transparent 18%, transparent 82%, black 95%);
          -webkit-mask-image: conic-gradient(from var(--pointer-deg) at center, black 5%, transparent 18%, transparent 82%, black 95%);
          opacity: calc((var(--pointer-d) - var(--glow-sens)) / (100 - var(--glow-sens)));
          mix-blend-mode: var(--glow-blend);
          transition: opacity 0.25s ease-out;
        }
        .gec-root .gec-glow::before {
          content: "";
          position: absolute; inset: 28px; border-radius: inherit;
          box-shadow:
            inset 0 0 0 1px hsl(var(--glow-color) / 100%),
            inset 0 0 1px 0 hsl(var(--glow-color) / calc(var(--glow-boost) + 60%)),
            inset 0 0 3px 0 hsl(var(--glow-color) / calc(var(--glow-boost) + 50%)),
            inset 0 0 6px 0 hsl(var(--glow-color) / calc(var(--glow-boost) + 40%)),
            inset 0 0 15px 0 hsl(var(--glow-color) / calc(var(--glow-boost) + 30%)),
            0 0 1px 0 hsl(var(--glow-color) / calc(var(--glow-boost) + 60%)),
            0 0 3px 0 hsl(var(--glow-color) / calc(var(--glow-boost) + 50%)),
            0 0 6px 0 hsl(var(--glow-color) / calc(var(--glow-boost) + 40%)),
            0 0 15px 0 hsl(var(--glow-color) / calc(var(--glow-boost) + 30%)),
            0 0 25px 2px hsl(var(--glow-color) / calc(var(--glow-boost) + 20%)),
            0 0 50px 2px hsl(var(--glow-color) / calc(var(--glow-boost) + 10%));
        }
        .gec-root:not(:hover):not(.gec-animating) .gec-mesh-border,
        .gec-root:not(:hover):not(.gec-animating) .gec-glow {
          opacity: 0 !important;
          transition: opacity 0.75s ease-in-out;
        }
      `}</style>

      <div className="gec-mesh-border" />
      <div className="gec-glow" />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          borderRadius: "inherit",
          background: "var(--card-bg)",
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

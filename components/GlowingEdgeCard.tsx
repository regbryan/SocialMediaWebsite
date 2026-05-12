"use client";

import React, { useRef } from "react";

export interface GlowingEdgeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const round = (v: number, p = 3) => parseFloat(v.toFixed(p));
const clamp = (v: number, lo = 0, hi = 100) => Math.min(Math.max(v, lo), hi);

export default function GlowingEdgeCard({ className, children, style, ...props }: GlowingEdgeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
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

    el.style.setProperty("--pointer-deg", `${round(angleDeg)}deg`);
    el.style.setProperty("--pointer-d", `${round(edge * 100)}`);
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={`gec-root ${className ?? ""}`}
      style={
        {
          position: "relative",
          borderRadius: "20px",
          "--glow-sens": "30",
          "--pointer-deg": "45deg",
          "--pointer-d": "0",
          "--card-bg": "#0f0f1a",
          "--glow-color": "262deg 100% 68%",
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      <style>{`
        .gec-root .gec-glow {
          position: absolute; inset: -20px; pointer-events: none; z-index: 2;
          border-radius: inherit;
          mask-image: conic-gradient(from var(--pointer-deg) at center, black 5%, transparent 18%, transparent 82%, black 95%);
          -webkit-mask-image: conic-gradient(from var(--pointer-deg) at center, black 5%, transparent 18%, transparent 82%, black 95%);
          opacity: calc((var(--pointer-d) - var(--glow-sens)) / (100 - var(--glow-sens)));
          mix-blend-mode: plus-lighter;
          transition: opacity 0.25s ease-out;
        }
        .gec-root .gec-glow::before {
          content: "";
          position: absolute; inset: 20px; border-radius: inherit;
          box-shadow:
            inset 0 0 0 1px hsl(var(--glow-color) / 90%),
            inset 0 0 6px 0 hsl(var(--glow-color) / 40%),
            0 0 8px 0 hsl(var(--glow-color) / 35%),
            0 0 24px 2px hsl(var(--glow-color) / 20%);
        }
        .gec-root:not(:hover) .gec-glow {
          opacity: 0 !important;
          transition: opacity 0.5s ease-in-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .gec-root .gec-glow { transition: none !important; }
        }
      `}</style>

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

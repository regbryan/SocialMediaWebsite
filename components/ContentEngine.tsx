"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";

type Slide = {
  src: string;
  platform: "INSTAGRAM" | "LINKEDIN";
  brand: string;
  accent: string;
};

// All slides locked to 4:5 Instagram aspect (0.806) for uniform sizing.
// Accent is brand purple — single accent across slides per DESIGN.md "one accent" principle.
const ACCENT = "#8b5cff";
const SLIDES: Slide[] = [
  { src: "/portfolio/v3_01_spring_ac.png", platform: "INSTAGRAM", brand: "Inland Empire Comfort", accent: ACCENT },
  { src: "/portfolio/omega-tax.png", platform: "INSTAGRAM", brand: "Omega Mortgage", accent: ACCENT },
  { src: "/portfolio/v2_02_myth_20pct.png", platform: "INSTAGRAM", brand: "Stephanie Perez Home Loans", accent: ACCENT },
  { src: "/portfolio/v5_06f_myth_busted.png", platform: "INSTAGRAM", brand: "Inland Empire Comfort", accent: ACCENT },
  { src: "/portfolio/v1_01_bright_canary_explainer.png", platform: "INSTAGRAM", brand: "Cyber Safety Cop", accent: ACCENT },
  { src: "/portfolio/v6_07_mothers_day.png", platform: "INSTAGRAM", brand: "Inland Empire Comfort", accent: ACCENT },
];

const BEAT_MS = 2800;

const STACK_POSITIONS = [
  { x: 0, y: 0, z: 0, scale: 1, blur: 0, opacity: 1, rotate: 0 },
  { x: 110, y: 60, z: -200, scale: 0.82, blur: 3, opacity: 0.55, rotate: 6 },
  { x: -130, y: 90, z: -340, scale: 0.72, blur: 7, opacity: 0.35, rotate: -8 },
  { x: 180, y: -40, z: -480, scale: 0.62, blur: 12, opacity: 0.18, rotate: 10 },
];

export default function ContentEngine() {
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState<"intro" | "loop">("intro");
  const containerRef = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 20 });
  const smy = useSpring(my, { stiffness: 60, damping: 20 });
  const tiltX = useTransform(smy, [-1, 1], [3, -3]);
  const tiltY = useTransform(smx, [-1, 1], [-5, 5]);

  // Intro sequence — one-shot on mount
  useEffect(() => {
    const phaseTimer = setTimeout(() => setPhase("loop"), 1800);
    return () => clearTimeout(phaseTimer);
  }, []);

  // Beat cycle — only runs after intro completes
  useEffect(() => {
    if (phase !== "loop") return;
    const id = setInterval(() => {
      setActive((a) => (a + 1) % SLIDES.length);
    }, BEAT_MS);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      mx.set(nx);
      my.set(ny);
    };
    const onLeave = () => { mx.set(0); my.set(0); };
    window.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [mx, my]);

  const heroSlide = SLIDES[active];

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: 1400,
        perspectiveOrigin: "50% 50%",
      }}
    >
      {/* Accent glow — follows active slide brand color */}
      <motion.div
        key={`glow-${active}`}
        aria-hidden
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 0.55, scale: 1 }}
        transition={{
          duration: phase === "intro" ? 1.6 : 1.2,
          delay: phase === "intro" ? 0.3 : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: heroSlide.accent,
          filter: "blur(140px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* 3D stack — 4:5 IG aspect */}
      <motion.div
        style={{
          position: "relative",
          width: 340,
          height: 425,
          transformStyle: "preserve-3d",
          rotateX: tiltX,
          rotateY: tiltY,
        }}
      >
        {SLIDES.map((slide, i) => {
          const offset = (i - active + SLIDES.length) % SLIDES.length;
          const pos = STACK_POSITIONS[Math.min(offset, STACK_POSITIONS.length - 1)];
          const hidden = offset >= STACK_POSITIONS.length;

          // Intro: each card flies in from offscreen-right, deep back, staggered by stack offset
          // Hero card comes in LAST so it lands on top
          const introDelay = (SLIDES.length - 1 - offset) * 0.09;

          return (
            <motion.div
              key={slide.src}
              initial={{
                x: 720,
                y: -120,
                z: -1400,
                scale: 0.35,
                rotateZ: 18,
                opacity: 0,
                filter: "blur(32px)",
              }}
              animate={{
                x: pos.x,
                y: pos.y,
                z: pos.z,
                scale: pos.scale,
                rotateZ: pos.rotate,
                opacity: hidden ? 0 : pos.opacity,
                filter: `blur(${pos.blur}px)`,
              }}
              transition={{
                type: "spring",
                stiffness: 90,
                damping: 20,
                mass: 0.9,
                bounce: 0,
                delay: phase === "intro" ? introDelay : 0,
              }}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 28,
                overflow: "hidden",
                background: "#0a0a14",
                boxShadow: offset === 0
                  ? `0 40px 80px -20px ${slide.accent}66, 0 20px 40px -15px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08) inset`
                  : "0 20px 40px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset",
                transformStyle: "preserve-3d",
                willChange: "transform, filter, opacity",
              }}
            >
              <Image
                src={slide.src}
                alt=""
                fill
                sizes="(max-width: 960px) 80vw, 340px"
                draggable={false}
                priority={offset === 0}
                style={{
                  objectFit: "cover",
                  userSelect: "none",
                }}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Floating meta — platform tag, brand */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.25, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          top: "8%",
          left: "4%",
          zIndex: 4,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`platform-${active}`}
            initial={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 3, filter: "blur(3px)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${heroSlide.accent}55`,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.22em",
              color: "white",
              textTransform: "uppercase",
              width: "fit-content",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: heroSlide.accent,
                boxShadow: `0 0 10px ${heroSlide.accent}`,
              }}
            />
            {heroSlide.platform}
          </motion.div>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.div
            key={`brand-${active}`}
            initial={{ opacity: 0, y: -6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 2, filter: "blur(2px)" }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(220,220,240,0.9)",
              letterSpacing: "0.02em",
            }}
          >
            {heroSlide.brand}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Corner ticks */}
      <CornerTicks />
    </div>
  );
}

function CornerTicks() {
  const tick: React.CSSProperties = {
    position: "absolute",
    width: 16,
    height: 16,
    border: "1px solid rgba(255,255,255,0.25)",
    zIndex: 3,
    pointerEvents: "none",
  };
  return (
    <>
      <div style={{ ...tick, top: 0, left: 0, borderRight: "none", borderBottom: "none" }} />
      <div style={{ ...tick, top: 0, right: 0, borderLeft: "none", borderBottom: "none" }} />
      <div style={{ ...tick, bottom: 0, left: 0, borderRight: "none", borderTop: "none" }} />
      <div style={{ ...tick, bottom: 0, right: 0, borderLeft: "none", borderTop: "none" }} />
    </>
  );
}

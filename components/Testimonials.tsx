"use client";

import { useEffect, useRef, useState } from "react";

const testimonials = [
  {
    quote:
      "SocialPulse took our Instagram from crickets to consistent bookings. Our content actually looks like a real brand now, and we're getting DMs from dream clients every week.",
    name: "Sarah Martinez",
    title: "Founder",
    company: "Blitz Organization",
    initials: "SM",
    accent: "#8b5cff",
  },
  {
    quote:
      "We've tried three agencies before. These guys are the first ones who actually understood our voice and ran with it. Our reels started going viral within a month.",
    name: "Mike Torres",
    title: "Owner",
    company: "Inland Empire Comfort",
    initials: "MT",
    accent: "#3b81ff",
  },
  {
    quote:
      "They handle everything — strategy, writing, design, posting. I just review and approve. Our lead volume from LinkedIn is up 4x since we started working together.",
    name: "Doug Mitchell, Esq.",
    title: "Managing Partner",
    company: "Mitchell Legal",
    initials: "DM",
    accent: "#b18bff",
  },
];

const AUTO_ADVANCE_MS = 6500;

function Stars() {
  return (
    <div className="flex" style={{ gap: "3px" }}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#ffc857">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function Arrow({ dir, onClick, label }: { dir: "left" | "right"; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: "44px",
        height: "44px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "rgba(255,255,255,0.8)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.2s, border-color 0.2s, transform 0.2s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(139,92,255,0.15)";
        e.currentTarget.style.borderColor = "rgba(139,92,255,0.4)";
        e.currentTarget.style.transform = "scale(1.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {dir === "left" ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
      </svg>
    </button>
  );
}

export default function Testimonials() {
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const go = (next: number) => {
    const len = testimonials.length;
    const normalized = ((next % len) + len) % len;
    setDirection(normalized > idx || (idx === len - 1 && normalized === 0) ? 1 : -1);
    setIdx(normalized);
  };
  const next = () => go(idx + 1);
  const prev = () => go(idx - 1);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setDirection(1);
      setIdx((i) => (i + 1) % testimonials.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const t = testimonials[idx];

  return (
    <section
      style={{
        backgroundColor: "#07070e",
        padding: "100px clamp(24px, 6vw, 120px)",
      }}
    >
      <div
        className="mx-auto flex flex-col"
        style={{ maxWidth: "1280px", gap: "48px" }}
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center" style={{ gap: "14px" }}>
          <span
            style={{
              color: "#8b5cff",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            Client Love
          </span>
          <h2
            style={{
              fontSize: "clamp(32px, 4.5vw, 48px)",
              fontWeight: 700,
              color: "white",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            What Our Clients <span className="gradient-text">Say</span>
          </h2>
          <p
            style={{
              color: "#9999a6",
              fontSize: "17px",
              lineHeight: 1.5,
              margin: 0,
              maxWidth: "540px",
            }}
          >
            Real feedback from the brands we work with every day.
          </p>
        </div>

        {/* Carousel */}
        <div
          className="flex items-center"
          style={{ gap: "20px", justifyContent: "center" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStartX.current == null) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
            touchStartX.current = null;
          }}
        >
          <div className="hidden md:block">
            <Arrow dir="left" onClick={prev} label="Previous testimonial" />
          </div>

          {/* Card viewport */}
          <div
            style={{
              width: "100%",
              maxWidth: "720px",
              position: "relative",
              overflow: "hidden",
              borderRadius: "22px",
            }}
          >
            {/* Ambient accent behind card */}
            <div
              style={{
                position: "absolute",
                top: "-80px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "320px",
                height: "320px",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${t.accent}30 0%, transparent 70%)`,
                filter: "blur(20px)",
                pointerEvents: "none",
                transition: "background 0.6s ease",
                zIndex: 0,
              }}
            />

            <div
              key={idx}
              className="testi-card"
              style={{
                position: "relative",
                zIndex: 1,
                backgroundColor: "#0f0f1a",
                border: "1px solid #1a1a2e",
                borderRadius: "22px",
                padding: "clamp(28px, 4vw, 44px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "22px",
                overflow: "hidden",
                animation: `testiIn${direction > 0 ? "R" : "L"} 0.55s cubic-bezier(0.22, 1, 0.36, 1) both`,
              }}
            >
              {/* Corner accent */}
              <div
                style={{
                  position: "absolute",
                  top: "-80px",
                  right: "-80px",
                  width: "260px",
                  height: "260px",
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${t.accent}22 0%, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />

              {/* Quote mark */}
              <svg width="38" height="38" viewBox="0 0 24 24" fill={t.accent} style={{ opacity: 0.45 }}>
                <path d="M7.17 17q-1.32 0-2.24-.92T4 13.84q0-1.1.55-2.43t1.88-3.04Q7.76 6.68 10 5l.66.86q-1.6 1.14-2.72 2.44t-1.62 2.63q.2-.06.42-.1t.43-.04q1.23 0 2.08.89t.85 2.07q0 1.32-.86 2.28T7.17 17zm9 0q-1.32 0-2.24-.92T13 13.84q0-1.1.55-2.43t1.88-3.04q1.34-1.69 3.57-3.37l.66.86q-1.6 1.14-2.72 2.44t-1.62 2.63q.2-.06.42-.1t.43-.04q1.23 0 2.08.89t.85 2.07q0 1.32-.86 2.28t-2.07.97z" />
              </svg>

              <Stars />

              <p
                style={{
                  color: "#d4d4de",
                  fontSize: "clamp(16px, 1.6vw, 20px)",
                  lineHeight: 1.6,
                  margin: 0,
                  position: "relative",
                  zIndex: 1,
                  fontWeight: 400,
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              <div style={{ height: "1px", background: "#1a1a2e", margin: "4px 0", width: "80px", alignSelf: "center" }} />

              <div className="flex items-center" style={{ gap: "14px", justifyContent: "center" }}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "999px",
                    background: `linear-gradient(135deg, ${t.accent}, ${t.accent}88)`,
                    color: "white",
                    fontSize: "15px",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    flexShrink: 0,
                  }}
                >
                  {t.initials}
                </div>
                <div className="flex flex-col" style={{ gap: "2px", minWidth: 0 }}>
                  <span style={{ color: "white", fontSize: "15px", fontWeight: 600 }}>{t.name}</span>
                  <span style={{ color: "#9999a6", fontSize: "13px" }}>
                    {t.title} · {t.company}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <Arrow dir="right" onClick={next} label="Next testimonial" />
          </div>
        </div>

        {/* Dots + mobile arrows */}
        <div className="flex items-center justify-center" style={{ gap: "16px" }}>
          <div className="md:hidden">
            <Arrow dir="left" onClick={prev} label="Previous" />
          </div>

          <div className="flex items-center" style={{ gap: "10px" }}>
            {testimonials.map((_, i) => {
              const active = i === idx;
              return (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  style={{
                    width: active ? "28px" : "8px",
                    height: "8px",
                    borderRadius: "999px",
                    border: "none",
                    background: active ? "linear-gradient(90deg, #8b5cff, #3b81ff)" : "rgba(255,255,255,0.15)",
                    cursor: "pointer",
                    transition: "width 0.35s cubic-bezier(0.22, 1, 0.36, 1), background 0.35s",
                    padding: 0,
                  }}
                />
              );
            })}
          </div>

          <div className="md:hidden">
            <Arrow dir="right" onClick={next} label="Next" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes testiInR {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes testiInL {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}

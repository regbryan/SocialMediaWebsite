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

function StarRow() {
  return (
    <div className="flex" style={{ gap: "2px" }}>
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="#ffc857"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section
      style={{
        backgroundColor: "#07070e",
        padding: "100px clamp(24px, 6vw, 120px)",
      }}
    >
      <div
        className="mx-auto flex flex-col"
        style={{ maxWidth: "1280px", gap: "56px" }}
      >
        {/* Header */}
        <div
          className="flex flex-col items-center text-center"
          style={{ gap: "14px" }}
        >
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

        {/* Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ gap: "24px" }}
        >
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="card-hover flex flex-col"
              style={{
                backgroundColor: "#0f0f1a",
                border: "1px solid #1a1a2e",
                borderRadius: "20px",
                padding: "32px",
                gap: "20px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Subtle accent */}
              <div
                style={{
                  position: "absolute",
                  top: "-60px",
                  right: "-60px",
                  width: "200px",
                  height: "200px",
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${t.accent}22 0%, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />

              {/* Quote mark */}
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill={t.accent}
                style={{ opacity: 0.4 }}
              >
                <path d="M7.17 17q-1.32 0-2.24-.92T4 13.84q0-1.1.55-2.43t1.88-3.04Q7.76 6.68 10 5l.66.86q-1.6 1.14-2.72 2.44t-1.62 2.63q.2-.06.42-.1t.43-.04q1.23 0 2.08.89t.85 2.07q0 1.32-.86 2.28T7.17 17zm9 0q-1.32 0-2.24-.92T13 13.84q0-1.1.55-2.43t1.88-3.04q1.34-1.69 3.57-3.37l.66.86q-1.6 1.14-2.72 2.44t-1.62 2.63q.2-.06.42-.1t.43-.04q1.23 0 2.08.89t.85 2.07q0 1.32-.86 2.28t-2.07.97z" />
              </svg>

              {/* Stars */}
              <StarRow />

              {/* Quote */}
              <p
                style={{
                  color: "#bfbfcc",
                  fontSize: "15px",
                  lineHeight: 1.65,
                  margin: 0,
                  flexGrow: 1,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Divider */}
              <div
                style={{
                  height: "1px",
                  background: "#1a1a2e",
                  margin: "0 -32px",
                }}
              />

              {/* Attribution */}
              <div className="flex items-center" style={{ gap: "14px" }}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "999px",
                    background: `linear-gradient(135deg, ${t.accent}, ${t.accent}88)`,
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    flexShrink: 0,
                  }}
                >
                  {t.initials}
                </div>
                <div className="flex flex-col" style={{ gap: "2px", minWidth: 0 }}>
                  <span
                    style={{
                      color: "white",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    {t.name}
                  </span>
                  <span style={{ color: "#9999a6", fontSize: "13px" }}>
                    {t.title} · {t.company}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

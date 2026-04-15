const steps = [
  {
    number: "01",
    title: "Discovery",
    description:
      "We learn your brand voice, audience, competitors, and goals. You'll fill out a strategy brief and we'll audit your current presence.",
    duration: "Week 1",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Strategy",
    description:
      "We build a 30-day content calendar, pillar themes, and a platform mix. You review and approve before we produce a thing.",
    duration: "Week 2",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Execution",
    description:
      "We write captions, design posts, shoot reels, and publish on schedule. You stay in the loop via a shared board and weekly check-ins.",
    duration: "Ongoing",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Reporting",
    description:
      "Monthly deep-dive reports with what worked, what didn't, and where we're doubling down. We optimize as we learn.",
    duration: "Monthly",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

export default function Process() {
  return (
    <section
      id="process"
      style={{
        backgroundColor: "#090912",
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
            How We Work
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
            From zero to <span className="gradient-text">consistent</span> in 14 days
          </h2>
          <p
            style={{
              color: "#9999a6",
              fontSize: "17px",
              lineHeight: 1.5,
              margin: 0,
              maxWidth: "560px",
            }}
          >
            A clear process so you know exactly what happens from day one.
          </p>
        </div>

        {/* Steps */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          style={{ gap: "20px" }}
        >
          {steps.map((step, idx) => (
            <div
              key={step.number}
              className="card-hover flex flex-col"
              style={{
                backgroundColor: "#0f0f1a",
                border: "1px solid #1a1a2e",
                borderRadius: "20px",
                padding: "28px",
                gap: "18px",
                position: "relative",
              }}
            >
              {/* Connector line (between cards on lg+) */}
              {idx < steps.length - 1 && (
                <div
                  className="hidden lg:block"
                  style={{
                    position: "absolute",
                    top: "48px",
                    right: "-12px",
                    width: "24px",
                    height: "2px",
                    background:
                      "linear-gradient(90deg, rgba(139,92,255,0.5), rgba(139,92,255,0.1))",
                    zIndex: 1,
                  }}
                />
              )}

              {/* Top row: icon + step number */}
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, rgba(139,92,255,0.2), rgba(59,129,255,0.15))",
                    border: "1px solid rgba(139,92,255,0.3)",
                    color: "#b18bff",
                  }}
                >
                  {step.icon}
                </div>
                <span
                  style={{
                    fontSize: "36px",
                    fontWeight: 700,
                    color: "#1a1a2e",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  {step.number}
                </span>
              </div>

              {/* Title */}
              <div className="flex flex-col" style={{ gap: "6px" }}>
                <span
                  style={{
                    color: "#b18bff",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                  }}
                >
                  {step.duration}
                </span>
                <h3
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "white",
                    letterSpacing: "-0.02em",
                    margin: 0,
                  }}
                >
                  {step.title}
                </h3>
              </div>

              {/* Description */}
              <p
                style={{
                  color: "#9999a6",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    number: "01",
    title: "Discovery",
    line: "We learn your brand, audience, and goals.",
  },
  {
    number: "02",
    title: "Strategy",
    line: "We build a 30-day calendar. You approve before we produce.",
  },
  {
    number: "03",
    title: "Execution",
    line: "We write, design, shoot, and publish on schedule.",
  },
  {
    number: "04",
    title: "Reporting",
    line: "Monthly deep-dives on what worked and where we double down.",
  },
];

export default function Process() {
  return (
    <section
      id="process"
      style={{
        backgroundColor: "#090912",
        padding: "120px clamp(24px, 6vw, 120px)",
      }}
    >
      <div
        className="mx-auto flex flex-col"
        style={{ maxWidth: "1280px", gap: "72px" }}
      >
        {/* Header */}
        <div className="flex flex-col" style={{ gap: "14px", maxWidth: "640px" }}>
          <span className="eyebrow">How We Work</span>
          <h2
            className="display-heading"
            style={{ fontSize: "clamp(44px, 6vw, 80px)" }}
          >
            From zero to consistent in 14 days
          </h2>
        </div>

        {/* Steps — typographic row, no cards */}
        <ol className="process-steps">
          {steps.map((step, idx) => (
            <li key={step.number} className="process-step">
              {idx > 0 && <span aria-hidden className="process-rule" />}
              <div className="flex flex-col" style={{ gap: "16px" }}>
                <span
                  style={{
                    color: "#8b5cff",
                    fontFamily: "var(--font-anton), 'Anton', sans-serif",
                    fontSize: "13px",
                    fontWeight: 400,
                    letterSpacing: "0.18em",
                  }}
                >
                  {step.number}
                </span>
                <h3
                  className="display-heading"
                  style={{
                    fontSize: "clamp(28px, 3vw, 36px)",
                    lineHeight: 1,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    color: "#bfbfcc",
                    fontSize: "15px",
                    lineHeight: 1.55,
                    margin: 0,
                    maxWidth: "26ch",
                  }}
                >
                  {step.line}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <style>{`
        .process-steps {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
        }
        .process-step {
          position: relative;
          padding: 0 32px 0 0;
        }
        .process-rule {
          position: absolute;
          left: -16px;
          top: 6px;
          width: 1px;
          height: 100%;
          background: #1a1a2e;
        }
        @media (max-width: 900px) {
          .process-steps {
            grid-template-columns: 1fr;
            gap: 48px;
          }
          .process-step {
            padding: 0;
          }
          .process-rule {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}

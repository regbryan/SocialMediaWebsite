import ContentEngine from "./ContentEngine";

export default function Hero() {
  return (
    <section
      id="hero"
      style={{
        backgroundColor: "#07070e",
        position: "relative",
        minHeight: "100vh",
        padding: "100px clamp(24px, 6vw, 120px) 80px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {/* Ambient floating orbs — purple + blue brand */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "18%",
          left: "8%",
          width: "384px",
          height: "384px",
          borderRadius: "50%",
          background: "#8b5cff",
          opacity: 0.18,
          filter: "blur(120px)",
          animation: "hero-orb-float 6s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "12%",
          right: "10%",
          width: "384px",
          height: "384px",
          borderRadius: "50%",
          background: "#3b81ff",
          opacity: 0.16,
          filter: "blur(120px)",
          animation: "hero-orb-float 6s ease-in-out infinite 3s",
          pointerEvents: "none",
        }}
      />

      <div
        className="mx-auto hero-grid"
        style={{
          maxWidth: "1440px",
          width: "100%",
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
          gap: "clamp(24px, 4vw, 72px)",
          alignItems: "center",
        }}
      >
        {/* LEFT — headline */}
        <div>
          <h1
            style={{
              fontFamily: "var(--font-anton), 'Anton', sans-serif",
              fontSize: "clamp(48px, 8.5vw, 128px)",
              lineHeight: 0.9,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              color: "white",
              margin: 0,
              fontWeight: 400,
            }}
          >
            Content
            <br />
            <span
              style={{
                WebkitTextStroke: "1.5px #c084fc",
                color: "transparent",
              }}
            >
              That
              <br />
              Converts
            </span>
          </h1>

          <div
            className="hero-bottom-row"
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "32px",
              marginTop: "clamp(16px, 2vw, 28px)",
              flexWrap: "wrap",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
                fontSize: "13px",
                fontWeight: 300,
                color: "#9999a6",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                lineHeight: 1.6,
                maxWidth: "320px",
                margin: 0,
              }}
            >
              Scroll-stopping social content — 5 to 7 posts per week across Instagram, LinkedIn &amp; more.
            </p>

            <a
              href="#portfolio"
              aria-label="Scroll to portfolio"
              className="hero-arrow"
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                textDecoration: "none",
                transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                flexShrink: 0,
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animation: "hero-arrow-bounce 2s ease-in-out infinite" }}
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="5 12 12 19 19 12" />
              </svg>
            </a>
          </div>
        </div>

        {/* RIGHT — content engine motion graphic */}
        <div
          className="hero-engine"
          style={{
            position: "relative",
            height: "min(640px, 72vh)",
            width: "100%",
          }}
        >
          <ContentEngine />
        </div>
      </div>

      <style>{`
        @keyframes hero-orb-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes hero-arrow-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
        .hero-arrow:hover {
          background: white;
          color: #07070e;
          border-color: white;
        }
        @media (max-width: 960px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
          .hero-engine {
            height: 520px !important;
            order: 2;
          }
        }
      `}</style>
    </section>
  );
}

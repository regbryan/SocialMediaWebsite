import HeroVideo from "./HeroVideo";

const stats = [
  { value: "500+", label: "Posts Created" },
  { value: "50+", label: "Happy Clients" },
  { value: "3x", label: "Avg. Engagement" },
  { value: "24/7", label: "Content Pipeline" },
];

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
      }}
    >
      {/* Ambient glow */}
      <div className="hero-glow" />

      <div
        className="mx-auto grid items-center"
        style={{
          maxWidth: "1280px",
          position: "relative",
          zIndex: 1,
          gap: "48px",
          gridTemplateColumns: "1fr",
        }}
      >
        <div
          className="hero-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "48px",
            alignItems: "start",
          }}
        >
          {/* Left column — content */}
          <div
            className="flex flex-col hero-content-col"
            style={{ gap: "28px" }}
          >
            {/* Headline */}
            <h1
              className="text-center lg:text-left"
              style={{
                fontSize: "clamp(40px, 6vw, 64px)",
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "white",
                margin: 0,
              }}
            >
              Elevate Your Brand&apos;s
              <br />
              <span className="gradient-text">Social Presence</span>
            </h1>

            {/* Description */}
            <p
              className="text-center lg:text-left"
              style={{
                fontSize: "18px",
                lineHeight: 1.6,
                color: "#9999a6",
                maxWidth: "560px",
                margin: 0,
              }}
            >
              We create scroll-stopping content that grows your audience. 5-7
              posts per week across Instagram, Facebook, LinkedIn &amp; more.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row items-center lg:items-start lg:justify-start justify-center"
              style={{ gap: "16px", marginTop: "4px" }}
            >
              <a
                href="#portfolio"
                className="btn-gradient"
                style={{
                  color: "white",
                  fontSize: "16px",
                  fontWeight: 600,
                  padding: "14px 32px",
                  borderRadius: "10px",
                  display: "inline-block",
                }}
              >
                View Our Work
              </a>
              <a
                href="mailto:hello@socialpulse.media?subject=Book%20a%20Call"
                className="btn-ghost"
                style={{
                  border: "1px solid #1a1a2e",
                  color: "#bfbfcc",
                  fontSize: "16px",
                  fontWeight: 600,
                  padding: "14px 32px",
                  borderRadius: "10px",
                  display: "inline-block",
                  backgroundColor: "transparent",
                }}
              >
                Book a Call
              </a>
            </div>

            {/* Stats */}
            <div
              className="grid grid-cols-2 md:grid-cols-4 w-full"
              style={{ gap: "16px", marginTop: "20px" }}
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center justify-center card-hover"
                  style={{
                    backgroundColor: "#0f0f1a",
                    border: "1px solid #1a1a2e",
                    borderRadius: "14px",
                    padding: "22px 12px",
                    gap: "6px",
                  }}
                >
                  <span
                    className="gradient-text"
                    style={{
                      fontSize: "30px",
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#9999a6",
                      textAlign: "center",
                      lineHeight: 1.3,
                    }}
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — hero video (desktop only) */}
          <div className="hero-graphic-col hidden lg:flex">
            <HeroVideo />
          </div>
        </div>
      </div>

      {/* Responsive grid via CSS */}
      <style>{`
        @media (min-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1.1fr 1fr !important;
            gap: 56px !important;
          }
          .hero-graphic-col {
            display: flex !important;
            align-items: flex-start;
            justify-content: center;
            align-self: start;
          }
        }
      `}</style>
    </section>
  );
}

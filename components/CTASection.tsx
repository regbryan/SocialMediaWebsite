export default function CTASection() {
  return (
    <section
      id="contact"
      style={{
        backgroundColor: "#07070e",
        padding: "80px clamp(24px, 6vw, 120px)",
      }}
    >
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div
          className="flex flex-col items-center text-center"
          style={{
            backgroundColor: "#0f0f1a",
            border: "1.5px solid rgba(139,92,255,0.6)",
            borderRadius: "24px",
            padding: "64px 40px",
            gap: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(28px, 3.5vw, 40px)",
              fontWeight: 700,
              color: "white",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              margin: 0,
              maxWidth: "640px",
            }}
          >
            Ready to Transform Your Social Media?
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.65,
              color: "#9999a6",
              maxWidth: "540px",
              margin: 0,
            }}
          >
            Let&apos;s build a content strategy that grows your brand. Book a free
            consultation and see what we can do for you.
          </p>
          <div
            className="flex flex-col sm:flex-row"
            style={{ gap: "16px", marginTop: "16px" }}
          >
            <a
              href="mailto:hello@socialpulse.media"
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
              Book Free Consultation
            </a>
            <a
              href="#pricing"
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
              See Pricing
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

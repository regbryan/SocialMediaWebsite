"use client";

import { ShinyButton } from "@/components/ui/shiny-button";

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
            className="display-heading"
            style={{ fontSize: "clamp(44px, 6vw, 80px)", maxWidth: "900px" }}
          >
            Ready to <span className="accent">Transform</span> Your Social Media?
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
            <ShinyButton onClick={() => (window.location.href = "mailto:hello@socialpulse.media")}>
              Book Free Consultation
            </ShinyButton>
            <ShinyButton
              variant="secondary"
              onClick={() => (window.location.hash = "#pricing")}
            >
              See Pricing
            </ShinyButton>
          </div>
        </div>
      </div>
    </section>
  );
}

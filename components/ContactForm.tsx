"use client";

import { useState } from "react";
import { ShinyButton } from "@/components/ui/shiny-button";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (json.success) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
        setErrorMsg(json.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col" style={{ gap: "16px", width: "100%" }}>
      {/* Web3Forms access key — replace with env var before production */}
      <input
        type="hidden"
        name="access_key"
        value={process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "YOUR_ACCESS_KEY_HERE"}
      />
      <input type="hidden" name="subject" value="New SocialPulse inquiry" />
      <input type="hidden" name="from_name" value="SocialPulse Website" />
      {/* Honeypot for bots */}
      <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "12px" }}>
        <Field name="name" label="Name" placeholder="Jane Doe" required />
        <Field name="email" label="Email" type="email" placeholder="jane@company.com" required />
      </div>
      <Field name="company" label="Company" placeholder="Optional" />
      <Field
        name="message"
        label="What can we help with?"
        placeholder="Tell us about your goals, audience, and timeline."
        textarea
        required
      />

      <div className="flex items-center" style={{ gap: "16px", marginTop: "6px", flexWrap: "wrap" }}>
        <ShinyButton type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending…" : "Send Message"}
        </ShinyButton>
        {status === "success" && (
          <span style={{ fontSize: "13px", color: "#a5f3c4" }}>
            Thanks. We&apos;ll get back to you within one business day.
          </span>
        )}
        {status === "error" && (
          <span style={{ fontSize: "13px", color: "#ff8a8a" }}>{errorMsg}</span>
        )}
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  required,
  textarea,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  const baseStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    padding: "12px 14px",
    fontSize: "14px",
    color: "white",
    fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
    outline: "none",
    width: "100%",
    transition: "border-color 0.2s ease, background 0.2s ease",
  };

  return (
    <label className="flex flex-col" style={{ gap: "6px" }}>
      <span
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.55)",
        }}
      >
        {label}
      </span>
      {textarea ? (
        <textarea
          name={name}
          placeholder={placeholder}
          required={required}
          rows={4}
          style={{ ...baseStyle, resize: "vertical", minHeight: "110px" }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(139,92,255,0.5)";
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
          }}
        />
      ) : (
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          required={required}
          style={baseStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(139,92,255,0.5)";
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
          }}
        />
      )}
    </label>
  );
}

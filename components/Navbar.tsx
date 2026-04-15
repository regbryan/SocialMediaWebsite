"use client";

import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: "rgba(7,7,14,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid #1a1a2e",
      }}
    >
    <div
      className="mx-auto flex items-center justify-between"
      style={{
        maxWidth: "1280px",
        padding: "16px clamp(24px, 6vw, 120px)",
        width: "100%",
      }}
    >
      {/* Logo */}
      <span
        style={{
          color: "white",
          fontSize: "22px",
          fontWeight: 700,
          letterSpacing: "-0.01em",
        }}
      >
        SocialPulse
      </span>

      {/* Desktop Nav */}
      <div
        className="hidden md:flex items-center"
        style={{ gap: "36px" }}
      >
        {["Portfolio", "Services", "Pricing", "About"].map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            style={{
              color: "#bfbfcc",
              fontSize: "15px",
              fontWeight: 500,
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
          >
            {link}
          </a>
        ))}
      </div>

      {/* CTA group */}
      <div className="hidden md:flex items-center" style={{ gap: "16px" }}>
        <a
          href="https://dashboard-eight-theta-24.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#bfbfcc",
            fontSize: "14px",
            fontWeight: 500,
            textDecoration: "none",
            transition: "color 0.2s ease",
          }}
        >
          Client Login
        </a>
        <a
          href="#contact"
          className="inline-flex items-center btn-gradient"
          style={{
            color: "white",
            fontSize: "14px",
            fontWeight: 600,
            padding: "10px 22px",
            borderRadius: "8px",
            textDecoration: "none",
          }}
        >
          Get Started
        </a>
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden flex flex-col"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
        style={{
          gap: "5px",
          padding: "8px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            display: "block",
            width: "22px",
            height: "2px",
            backgroundColor: "white",
            transition: "transform 0.2s",
            transform: menuOpen ? "rotate(45deg) translate(4px, 6px)" : "none",
          }}
        />
        <span
          style={{
            display: "block",
            width: "22px",
            height: "2px",
            backgroundColor: "white",
            opacity: menuOpen ? 0 : 1,
            transition: "opacity 0.2s",
          }}
        />
        <span
          style={{
            display: "block",
            width: "22px",
            height: "2px",
            backgroundColor: "white",
            transition: "transform 0.2s",
            transform: menuOpen ? "rotate(-45deg) translate(4px, -6px)" : "none",
          }}
        />
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="absolute md:hidden flex flex-col"
          style={{
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "#0f0f1a",
            borderBottom: "1px solid #1a1a2e",
            padding: "24px",
            gap: "16px",
          }}
        >
          {["Portfolio", "Services", "Pricing", "About"].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              style={{
                color: "#bfbfcc",
                fontSize: "15px",
                fontWeight: 500,
                textDecoration: "none",
              }}
              onClick={() => setMenuOpen(false)}
            >
              {link}
            </a>
          ))}
          <a
            href="https://dashboard-eight-theta-24.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#bfbfcc",
              fontSize: "15px",
              fontWeight: 500,
              textDecoration: "none",
            }}
            onClick={() => setMenuOpen(false)}
          >
            Client Login
          </a>
          <a
            href="#contact"
            className="btn-gradient"
            style={{
              color: "white",
              fontSize: "14px",
              fontWeight: 600,
              padding: "12px 24px",
              borderRadius: "8px",
              textAlign: "center",
              textDecoration: "none",
            }}
            onClick={() => setMenuOpen(false)}
          >
            Get Started
          </a>
        </div>
      )}
    </div>
    </nav>
  );
}

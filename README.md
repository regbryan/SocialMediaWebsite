# SocialPulse Media — Website

A high-end marketing website for SocialPulse Media, a social media content agency.

Built with **Next.js 16**, **Tailwind CSS v4**, and deployed on **Vercel**.

## Features

- 📱 Auto-playing phone mockup with cycling client reels
- 🎠 Continuous marquee carousel with platform-filtered portfolio (Instagram, Carousels, Reels, LinkedIn, Commercials)
- 🖼️ Silver-framed gallery cards with lightbox preview
- 🏷️ Animated client logo bar
- ⭐ Testimonials with star ratings
- 📋 4-step "How We Work" process section
- 🔐 Client Login link to the deployed dashboard

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  page.tsx            Landing page composition
  layout.tsx          Root layout + font
  globals.css         Design tokens + shared animations
components/
  Navbar.tsx          Top nav with Client Login
  Hero.tsx            Headline, CTAs, stats
  HeroGraphic.tsx     Phone mockup + floating hearts
  LogoBar.tsx         Animated client logos
  Portfolio.tsx       Marquee carousel + lightbox
  Services.tsx        Services grid
  Process.tsx         4-step workflow
  Testimonials.tsx    Client quotes
  CTASection.tsx      Conversion card
  Footer.tsx          Footer columns
public/
  logos/              Client brand logos
  portfolio/          Client work samples
```

## Design System

- **Primary accent:** `#8b5cff` (purple)
- **Secondary accent:** `#3b81ff` (blue)
- **Background:** `#07070e` / `#090912`
- **Cards:** `#0f0f1a`
- **Frames:** Silver gradient (metallic shine)

## Deployment

```bash
vercel
```

Or push to GitHub and connect the repo to Vercel for automatic deployments.

## Related Projects

- **Dashboard** — https://dashboard-eight-theta-24.vercel.app/ (client portal with Google OAuth)

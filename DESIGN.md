# Design

## Theme

Dark. The site is a content showcase — work must read like it does on Instagram and TikTok, against a near-black canvas that lets imagery, video, and silver frames carry the eye. Scene sentence: a prospect glancing at the site on a laptop in dim afternoon light, deciding in 30 seconds whether the work looks more expensive than what their current agency makes.

## Color Strategy

**Restrained, edging toward Committed.** A tinted-black canvas does 80% of the work. Purple (`#8b5cff` → `#b18bff`) is the single signature accent, used for outline strokes, hover glows, focus rings, and selection — never as a fill color for large surfaces. A secondary blue (`#3b81ff`) appears only inside the ambient hero glow gradient. Silver is treated as a material, not a color: animated metallic gradient on portfolio frames and the logotype.

## Color Palette

| Token | Value | Use |
|---|---|---|
| `--bg-main` | `#07070e` | Page canvas |
| `--bg-alt` | `#090912` | Section alternation, footer |
| `--bg-card` | `#0f0f1a` | Card surfaces, lightbox bg |
| `--border-color` | `#1a1a2e` | Hairlines, dividers, default card borders |
| `--bg-dark-purple` | `#261a40` | Hover/active backgrounds on tags & pills |
| `--bg-tag` | `#332659` | Eyebrow tag fill |
| `--purple` | `#8b5cff` | Primary accent — strokes, glows, links |
| `--blue` | `#3b81ff` | Hero glow gradient stop only |
| `--text-light-purple` | `#b18bff` | Accent outline text, gradient-text high stop |
| `--text-medium` | `#bfbfcc` | Body copy |
| `--text-muted` | `#9999a6` | Eyebrows, captions, metadata |
| `#ffffff` | white | Headlines and primary buttons |

Selection color is purple `rgba(139,92,255,0.4)`. Scrollbar thumb hover is purple.

## Typography

Three families, deliberate roles:

- **Anton** (`--font-anton`) — display headings only. Uppercase, `letter-spacing: -0.02em`, `line-height: 0.9`, weight 400. Used via the `.display-heading` class. The `.accent` modifier renders the word as a 1.5px purple outline (`-webkit-text-stroke`) with transparent fill — this is the signature typographic move.
- **Plus Jakarta Sans** (`--font-jakarta`) — body, UI, buttons. Default weights 400/500/600. Font features `cv11, ss01, ss03` enabled.
- **Geist** (`--font-sans`) — secondary sans, available via the shadcn theme layer for dashboard surfaces.

Eyebrow style is locked: 12px / 600 weight / `letter-spacing: 0.22em` / uppercase / `#9999a6`.

Body line length should stay 60–72ch in hero subhead and prose blocks.

## Spacing & Layout

Section rhythm is generous — vertical breathing room between sections is the primary "premium" cue. Sections alternate `--bg-main` and `--bg-alt` rather than using cards everywhere. Component-level radius scale comes from shadcn (`--radius: 0.625rem`) with the marquee/preview-btn family using `border-radius: 999px` for pill shapes.

Containers cap at the shadcn default; full-width is reserved for marquees (portfolio, logo bar) which run edge-to-edge under a `marquee-wrapper` mask that fades both sides.

## Components

- **Hero** — composition of `<Hero>` + `<HeroGraphic>` with a `hero-glow` radial behind the headline. Headline uses `.display-heading` with one `.accent` word as the typographic hero move.
- **LogoBar** — animated mono-treated client logos (`.logo-mono`, brightness 0 / invert 1, opacity 0.55 → 1 on hover) on an infinite marquee.
- **Portfolio** — silver-framed cards (`.silver-frame` + `silverShine` keyframes) on a continuous marquee carousel. Hover lifts card (`translateY(-6px)`), zooms image, fades in a glassy `preview-btn` overlay. Click opens a `lightbox-backdrop` modal at 92% opacity with 16px blur.
- **ShinyButton** — primary CTA via `.sp-shiny`: deep purple gradient pill, 1px `rgba(139,92,255,0.35)` border, inset highlight, soft purple drop-shadow. Secondary variant `.sp-shiny--secondary` is the ghost form.
- **Cards** — base surface `--bg-card` with `--border-color` hairlines, `.card-hover` lifts 4px on hover and gains a purple-tinted glow `0 16px 48px rgba(0,0,0,0.5), 0 0 24px rgba(139,92,255,0.18)`.
- **Footer, Testimonials, Process, Services, Pricing** — composed against `--bg-alt` sections with eyebrow + display-heading + body pattern.

## Motion

- Card hover: `transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)` (ease-out).
- Portfolio image zoom: `0.6s` same curve, `scale(1.06)`.
- Marquee: `transform: translateX(-50%)` continuous loop; pauses on hover via `marquee-wrapper:hover > div { animation-play-state: paused; }`.
- Silver frame shine: 8s ease-in-out gradient-position drift.
- Entrance: `.fade-up` — 20px lift + opacity, 0.8s ease-out, once.
- Badge shimmer: opacity 1 → 0.7 → 1 over 2.8s.

Hover transforms only on `transform` and `opacity` — never on width/height/padding. No bounce or elastic curves.

`prefers-reduced-motion`: marquees, fade-up, badge-shimmer, and silverShine must respect the user preference (currently a known gap — flagged in critique).

## Iconography & Imagery

- Client logos are mono-treated (`brightness(0) invert(1)`) so brand color doesn't fight purple accent.
- Portfolio thumbnails are 9:16 phone-shaped within the silver frame to evoke reels/stories.
- Hero supports an autoplay phone-mockup video (`HeroVideo.tsx`) and a separate `ContentEngine` motion graphic for the right panel.
- No stock photography. No abstract gradients as content. No decorative SVG flourishes.

## Known Gaps

These belong in DESIGN.md so future commands address them:
- `prefers-reduced-motion` is not yet honored for marquees, autoplay video, or `fade-up`.
- `.gradient-text` uses `background-clip: text` — flagged by impeccable shared design laws ("Gradient text" is an absolute ban). Used only on hero accent today; needs decision: remove, or carve a one-time exception with clear rationale.
- Custom scrollbar styling only covers WebKit (Firefox falls back to default).

# Brand Kit Schema Audit — Repo vs. `brand_kits`

Audit of existing brand folders (IEC, Omega, Blitz, Cyber Safety Cop, Doug Mitchell, Riverside Hat Co, SC Boardwalk Crew, Stephanie Perez) mapped against the Phase 1 `brand_kits` schema.

## Coverage matrix

Legend: ✓ found | ✗ missing | ~ partial

| Brand | slug | name | website | ig_handle | ig_follower | ig_is_business | competitors | tagline | description | colors | fonts | tone | logos (3v) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Inland Empire Comfort | ✓ | ✓ | ✓ iecomfortac.com | ✓ @inlandempirecomfort | ✗ | ✗ | ✗ | ~ | ✓ | ~ | ✗ | ✓ | ~ 1 |
| Omega Mortgage Group | ✓ | ✓ | ✓ omglending.com | ✓ @omglending | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ 3 |
| Blitz Organization | ✓ | ✓ | ✓ blitzedh.com | ✓ @blitzyourspace | ✗ | ✗ | ✗ | ~ | ✓ | ✓ | ✗ | ✓ | ✓ 4+ |
| Cyber Safety Cop | ✓ | ✓ | ~ | ✗ | ✗ | ✗ | ✗ | ~ | ✓ | ~ | ~ | ✓ | ~ 2 |
| Doug Mitchell | ✓ | ✓ | ~ LinkedIn | N/A | N/A | N/A | ✗ | ✗ | ~ | ✗ | ✗ | ~ | ~ 1 |
| Riverside Hat Co | ✓ | ✓ | ✓ | ✓ @riversidehatco | ✓ ~4.6k | ✗ | ✗ | ✗ | ~ | ✗ | ✗ | ✗ | ✗ |
| SC Boardwalk Crew | ✓ | ✓ | ✓ | ✓ @beachboardwalkjobs | ✗ | ✗ | ✗ | ✗ | ~ | ✗ | ✗ | ~ | ~ 1 |
| Stephanie Perez | ✓ | ✓ | ~ | ~ | ✗ | ✗ | ✗ | ✗ | ✓ | ~ | ~ | ✓ | ~ 2 |

### Takeaways
- `ig_follower_count`, `ig_is_business`, `competitor_handles` — missing for every brand → **instagrapi scraper job**.
- `colors` fully codified for only 3/8 → **color extraction + Review step is critical**.
- `fonts.heading/body` — not exact typefaces anywhere → **Google Fonts picker required**.
- 3-logo contract (primary/white/mark) only satisfied by Omega + Blitz → **schema must flex**.

## Schema gaps to address before Phase 1b

1. **`tagline` is too narrow.** Brands carry tagline + positioning + mission. → add `positioning text`, `mission text` (or `copy jsonb`).
2. **Logos have 4–6 variants.** Rigid `primary/white/mark` will not hold. → store logos via `brand_kit_assets` with `kind='logo'` + `meta.variant`, OR make `logos jsonb` an array `[{role, url, notes}]`.
3. **Tone vocabulary bank.** Every voice doc has phrase use/avoid lists + glossary. → add `tone.vocab_use[]`, `tone.vocab_avoid[]`, `tone.glossary{}`.
4. **Compliance footers.** Omega has a verbatim NMLS disclosure required on every post. → add `compliance_footer text` or `legal jsonb`.
5. **Target audiences (tiered).** Every starter has primary/secondary/tertiary with pain points. → add `audiences jsonb [{tier, description, pain_points[]}]`.
6. **Content pillars with % mix.** Omega §11 defines 5 pillars w/ percentages. → add `content_pillars jsonb`.
7. **Hashtag libraries.** Always-on / local / service / community buckets + density. → add `hashtags jsonb`.
8. **Photography direction.** Prescriptive visual DOs/DON'Ts (real families, golden hour…). → add `photography_direction text` or nest under `visual_direction jsonb`.
9. **Tone-by-context matrix.** Context → opener patterns (Omega §6). → `tone.context_matrix jsonb`.
10. **Asset kinds beyond logo.** Brands carry `cutouts/` folders of transparent people/object PNGs. → expand `brand_kit_assets.kind` enum to include `'cutout'`, `'photo_library'`.
11. **Field confidence.** Starters literally label themselves LOW/MED/HIGH. Onboarding should surface what's inferred. → `confidence jsonb` keyed by field.
12. **Platform flag.** Doug Mitchell is LinkedIn-only — IG columns shouldn't be required. → `primary_platform text` (ig/linkedin/facebook).
13. **History + founders.** Appear as open questions everywhere. → `founded_year int`, `founder_names text[]`.
14. **Location / service area.** IEC Riverside 92508, Omega 7 CA/NV branches, Blitz El Dorado Hills. → `hq_location text`, `service_area text[]`.
15. **Slug canonicalization.** Folder names have spaces/caps. Wizard already slugifies — confirm migration backfill matches.

## Suggested Phase 1b migration (additive)

```sql
alter table brand_kits
  add column if not exists positioning text,
  add column if not exists mission text,
  add column if not exists primary_platform text default 'instagram',
  add column if not exists audiences jsonb default '[]'::jsonb,
  add column if not exists content_pillars jsonb default '[]'::jsonb,
  add column if not exists hashtags jsonb default '{}'::jsonb,
  add column if not exists compliance_footer text,
  add column if not exists photography_direction text,
  add column if not exists hq_location text,
  add column if not exists service_area text[] default '{}',
  add column if not exists founded_year int,
  add column if not exists founder_names text[] default '{}',
  add column if not exists confidence jsonb default '{}'::jsonb;

-- Relax logo structure: recommend moving logos into brand_kit_assets
alter table brand_kit_assets
  drop constraint if exists brand_kit_assets_kind_check;
alter table brand_kit_assets
  add constraint brand_kit_assets_kind_check
  check (kind in ('logo','ig_post','hero_image','cutout','photo_library','other'));

-- Tone structure enrichment (stored inside existing jsonb — no DDL needed)
-- New shape: { keywords[], dos[], donts[], vocab_use[], vocab_avoid[], glossary{}, context_matrix{} }
```

## Implications for the wizard

- **Basics step**: unchanged (URL + IG handle).
- **Review step**: extend to cover positioning / mission / hq_location / founded_year (prefilled from scrape).
- **Voice step**: add vocab banks (use / avoid) + content pillars + hashtags.
- **New step "Audiences"** (optional): tier list w/ pain points.
- **Confirm step**: render confidence flags next to inferred fields.

## Open decisions

- Do we keep `logos jsonb` on brand_kits OR move entirely to `brand_kit_assets`? (Recommend: move. Single source of truth, scales to 6 variants.)
- Do we backfill existing folders into Supabase now, or wait for Phase 1b? (Recommend: wait — lets us design the wizard + migration together and backfill in one pass.)

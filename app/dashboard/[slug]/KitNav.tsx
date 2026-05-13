"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Sticky tab bar rendered by the kit layout. Always visible while
 * scrolling so the operator can jump between Overview · Previews ·
 * Content · Calendar · Edit · Assets without losing their place.
 *
 * Active state uses a purple underline + brighter text. Active state
 * is computed off `usePathname()` so it updates on client-side
 * navigation. Longest-suffix match handles nested routes
 * (e.g. /content/foo still highlights Content).
 */
const SECTIONS = [
  { label: "Overview", suffix: "" },
  { label: "Previews", suffix: "/previews" },
  { label: "Content", suffix: "/content" },
  { label: "Calendar", suffix: "/calendar" },
  { label: "Edit", suffix: "/edit" },
  { label: "Assets", suffix: "/assets" },
] as const;

export default function KitNav({ slug }: { slug: string }) {
  const pathname = usePathname() ?? "";
  const base = `/dashboard/${slug}`;

  const activeSuffix = (() => {
    let match = "";
    for (const s of SECTIONS) {
      const full = `${base}${s.suffix}`;
      if (s.suffix === "") continue;
      if (pathname === full || pathname.startsWith(`${full}/`)) {
        if (s.suffix.length > match.length) match = s.suffix;
      }
    }
    if (!match && (pathname === base || pathname === `${base}/`)) match = "";
    return match;
  })();

  return (
    <nav
      role="tablist"
      className="flex items-stretch gap-0 overflow-x-auto"
      aria-label="Kit sections"
    >
      {SECTIONS.map((s) => {
        const href = `${base}${s.suffix}`;
        const active = s.suffix === activeSuffix;
        return (
          <Link
            key={s.label}
            href={href}
            role="tab"
            aria-selected={active}
            className="relative whitespace-nowrap px-4 py-3 text-sm transition-colors"
            style={{
              color: active ? "white" : "rgb(170 170 180)",
              fontWeight: active ? 600 : 500,
            }}
          >
            {s.label}
            <span
              aria-hidden
              className="absolute inset-x-3 -bottom-px h-0.5 rounded-t-sm transition-opacity"
              style={{
                background: "#8b5cff",
                opacity: active ? 1 : 0,
                boxShadow: active
                  ? "0 0 12px rgba(139,92,255,0.5)"
                  : undefined,
              }}
            />
          </Link>
        );
      })}
    </nav>
  );
}

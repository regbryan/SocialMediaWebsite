"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Sub-navigation rendered by the kit layout — lets the operator jump
 * between Overview, Previews, Content, Calendar, Edit, and Assets from
 * any page within a single brand kit without bouncing through the
 * kit-detail page.
 *
 * Active state is computed off `usePathname()` so the highlight stays
 * accurate across client-side route changes.
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

  // Match the longest suffix to handle e.g. "/content" vs "/content/foo".
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
    <nav className="-mx-1 flex flex-wrap items-center gap-0.5 overflow-x-auto">
      {SECTIONS.map((s) => {
        const href = `${base}${s.suffix}`;
        const active = s.suffix === activeSuffix;
        return (
          <Link
            key={s.label}
            href={href}
            className="rounded-md px-3 py-1.5 text-sm transition-colors"
            style={{
              color: active ? "#b18bff" : "rgb(170 170 180)",
              background: active ? "rgba(139,92,255,0.10)" : "transparent",
              fontWeight: active ? 600 : 500,
            }}
          >
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}

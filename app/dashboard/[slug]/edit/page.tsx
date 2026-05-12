import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import {
  canViewKit,
  resolveDashboardUser,
} from "../../../../lib/dashboard-auth";
import EditKitForm from "./EditKitForm";

type Kit = {
  id: string;
  slug: string;
  name: string;
  tier: string | null;
  tagline: string | null;
  positioning: string | null;
  description: string | null;
  mission: string | null;
  colors: Record<string, string> | null;
  tone: {
    keywords?: string[];
    dos?: string[];
    donts?: string[];
    vocab_use?: string[];
    vocab_avoid?: string[];
  } | null;
  audiences:
    | Array<{
        tier: "primary" | "secondary" | "tertiary";
        description: string;
        pain_points: string[];
      }>
    | null;
  content_pillars:
    | Array<{ name: string; pct: number; description?: string }>
    | null;
  photography_direction: string | null;
  compliance_footer: string | null;
  contact_phone: string | null;
  preferred_channel: string | null;
  ig_handle: string | null;
  website_url: string | null;
  hq_location: string | null;
  founded_year: number | null;
  founder_names: string[] | null;
  service_area: string[] | null;
  hashtags: {
    always_on?: string[];
    local?: string[];
    service?: string[];
    community?: string[];
  } | null;
};

export const dynamic = "force-dynamic";

export default async function EditKitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await resolveDashboardUser();
  if (!canViewKit(user, slug)) notFound();

  const sb = supabaseAdmin();
  const { data: kit, error } = await sb
    .from("brand_kits")
    .select(
      "id, slug, name, tier, tagline, positioning, description, mission, colors, tone, audiences, content_pillars, photography_direction, compliance_footer, contact_phone, preferred_channel, ig_handle, website_url, hq_location, founded_year, founder_names, service_area, hashtags"
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error || !kit) notFound();
  const k = kit as Kit;
  const isAdmin = user.kind === "admin";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Edit brand kit
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update voice, copy, and visual direction. Editing here does not
          regenerate previews or content — re-run those if you want the
          updates reflected.
        </p>
      </div>

      <EditKitForm
        slug={k.slug}
        isAdmin={isAdmin}
        initial={{
          tier: (k.tier as "starter" | "growth" | "agency" | null) ?? null,
          tagline: k.tagline ?? "",
          positioning: k.positioning ?? "",
          description: k.description ?? "",
          mission: k.mission ?? "",
          colors: {
            primary: k.colors?.primary ?? "",
            secondary: k.colors?.secondary ?? "",
            accent: k.colors?.accent ?? "",
          },
          tone: {
            keywords: k.tone?.keywords ?? [],
            dos: k.tone?.dos ?? [],
            donts: k.tone?.donts ?? [],
            vocab_use: k.tone?.vocab_use ?? [],
            vocab_avoid: k.tone?.vocab_avoid ?? [],
          },
          audiences: k.audiences ?? [],
          content_pillars:
            k.content_pillars?.map((p) => ({
              name: p.name ?? "",
              pct: p.pct ?? 0,
              description: p.description ?? "",
            })) ?? [],
          photography_direction: k.photography_direction ?? "",
          compliance_footer: k.compliance_footer ?? "",
          contact_phone: k.contact_phone ?? "",
          preferred_channel: (k.preferred_channel as "email" | "sms") ?? "email",
          ig_handle: k.ig_handle ?? "",
          website_url: k.website_url ?? "",
          hq_location: k.hq_location ?? "",
          founded_year: k.founded_year ?? null,
          founder_names: k.founder_names ?? [],
          service_area: k.service_area ?? [],
          hashtags: {
            always_on: k.hashtags?.always_on ?? [],
            local: k.hashtags?.local ?? [],
            service: k.hashtags?.service ?? [],
            community: k.hashtags?.community ?? [],
          },
        }}
      />
    </div>
  );
}

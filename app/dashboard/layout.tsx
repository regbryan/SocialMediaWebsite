import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight"
          >
            <span className="inline-block size-2 rounded-full bg-gradient-to-br from-[#b18bff] to-[#3b81ff]" />
            SocialPulse <span className="text-muted-foreground">· Admin</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/dashboard"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Brand kits
            </Link>
            <Separator orientation="vertical" className="mx-1 h-5" />
            <Link
              href="/onboarding/basics"
              className={buttonVariants({ size: "sm" })}
            >
              New kit
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}

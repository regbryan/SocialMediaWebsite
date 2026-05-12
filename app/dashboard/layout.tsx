import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import LogoutButton from "./LogoutButton";
import ClientLogoutButton from "./ClientLogoutButton";
import { resolveDashboardUser } from "../../lib/dashboard-auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await resolveDashboardUser();
  if (user.kind === "none") {
    redirect("/login");
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <header
        className="sticky top-0 z-40 border-b"
        style={{ borderColor: "#1a1a2e", backgroundColor: "rgba(7,7,14,0.96)" }}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6 sm:py-4">
          <Link
            href="/dashboard"
            className="flex items-baseline gap-2 tracking-tight"
            style={{ color: "white", fontSize: "20px", fontWeight: 600, letterSpacing: "-0.02em" }}
          >
            SocialPulse
            <span style={{ color: "#9999a6", fontSize: "13px", fontWeight: 500, letterSpacing: "0" }}>
              {user.kind === "admin" ? "Admin" : "Client"}
            </span>
          </Link>

          {user.kind === "admin" ? (
            <nav className="flex w-full flex-wrap items-center gap-1 text-sm sm:w-auto">
              <Link
                href="/dashboard"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Brand kits
              </Link>
              <Link
                href="/dashboard/calendar"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Schedule
              </Link>
              <Link
                href="/dashboard/invites"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Invites
              </Link>
              <Separator orientation="vertical" className="mx-1 hidden h-5 sm:block" />
              <Link
                href="/dashboard/invites"
                className={buttonVariants({ size: "sm" }) + " whitespace-nowrap"}
              >
                + Invite
                <span className="hidden sm:inline">&nbsp;client</span>
              </Link>
              <Separator orientation="vertical" className="mx-1 hidden h-5 sm:block" />
              <LogoutButton />
            </nav>
          ) : (
            <nav className="flex items-center gap-3 text-sm">
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {user.email}
              </span>
              <ClientLogoutButton />
            </nav>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}

import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="dark flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <LoginForm next={next ?? "/dashboard"} />
    </div>
  );
}

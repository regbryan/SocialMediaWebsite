import Link from "next/link";

export default async function Done({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">You&apos;re all set</h2>
      <p className="text-neutral-600">
        Brand kit <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm">{slug}</code> is live.
        Our team will review and start creating content shortly.
      </p>
      <Link
        href="/"
        className="inline-block rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
      >
        Back to home
      </Link>
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-burgundy text-white font-serif text-2xl font-bold mb-8">
          CM
        </div>

        <p className="font-serif text-8xl font-bold text-gold mb-2 leading-none">
          404
        </p>

        <h1 className="font-serif text-2xl font-semibold text-ink mb-3">
          Page not found
        </h1>

        <p className="text-sm text-muted mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/admin"
            className="px-5 py-2.5 bg-burgundy text-white rounded-lg text-sm font-medium hover:bg-burgundy-dark transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/admin/login"
            className="px-5 py-2.5 border border-line text-ink rounded-lg text-sm font-medium hover:bg-cream transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

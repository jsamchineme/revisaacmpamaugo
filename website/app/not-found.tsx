import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 bg-paper flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-xl mx-auto">
        <p className="font-serif text-[7rem] sm:text-[10rem] font-bold leading-none text-gold/30 select-none mb-0">
          404
        </p>

        <div className="-mt-4 mb-6">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-ink mb-4">
            Page not found
          </h1>
          <p className="text-muted leading-relaxed text-base">
            The page you&apos;re looking for may have moved or no longer exists.
            Return home to explore sermons, teachings, and more.
          </p>
        </div>

        <div className="w-12 h-px bg-gold mx-auto mb-8" />

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-block py-3.5 px-7 rounded-full bg-burgundy text-white text-sm font-medium tracking-wide hover:bg-burgundy-dark hover:-translate-y-0.5 transition-all duration-200"
          >
            Return Home
          </Link>
          <Link
            href="/sermons"
            className="inline-block py-3.5 px-7 rounded-full border border-line text-ink text-sm font-medium tracking-wide hover:border-gold hover:text-gold-dark hover:-translate-y-0.5 transition-all duration-200"
          >
            Browse Sermons
          </Link>
        </div>
      </div>
    </div>
  );
}

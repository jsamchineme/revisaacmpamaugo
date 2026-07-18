import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-ink">Settings</h1>
        <p className="text-muted mt-1">Manage your app preferences.</p>
      </div>

      <div className="bg-white rounded-xl border border-line p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream mx-auto mb-4">
          <svg
            className="w-8 h-8 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <h2 className="font-serif text-2xl font-bold text-ink mb-2">
          Coming Soon
        </h2>
        <p className="text-muted mb-8 max-w-md mx-auto">
          Settings configuration will be available in a future update. Stay tuned.
        </p>
        <Link
          href="/admin"
          className="px-5 py-2.5 bg-burgundy text-white rounded-lg text-sm font-medium hover:bg-burgundy-dark transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

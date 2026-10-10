import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 text-center">
      <div>
        <p className="font-sans text-sm font-bold text-signal-ink">404</p>
        <h1 className="mt-3 text-3xl font-bold text-ink">This page could not be found.</h1>
        <p className="mt-3 text-sm text-ink-2">The address may have changed or the page may no longer exist.</p>
        <Link href="/" className="mt-6 inline-flex rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-signal-ink">Return home</Link>
      </div>
    </main>
  );
}

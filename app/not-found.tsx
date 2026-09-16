import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 text-center">
      <div>
        <p className="font-sans text-sm font-bold text-[#18794E]">404</p>
        <h1 className="mt-3 text-3xl font-bold text-[#141414]">This page could not be found.</h1>
        <p className="mt-3 text-sm text-[#666666]">The address may have changed or the page may no longer exist.</p>
        <Link href="/" className="mt-6 inline-flex rounded-lg bg-[#18794E] px-5 py-3 text-sm font-bold text-white hover:bg-[#115C3B]">Return home</Link>
      </div>
    </main>
  );
}

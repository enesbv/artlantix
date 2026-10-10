'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-paper px-6 text-center text-ink">
        <main>
          <p className="font-sans text-sm font-bold text-signal-ink">ARTLANTIX</p>
          <h1 className="mt-3 text-3xl font-bold">Something went wrong.</h1>
          <p className="mt-3 text-sm text-ink-2">Your work has not been submitted. Please try again.</p>
          <button onClick={reset} className="mt-6 rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-signal-ink">Try again</button>
        </main>
      </body>
    </html>
  );
}

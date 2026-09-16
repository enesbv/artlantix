'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[#F9F8F6] px-6 text-center text-[#141414]">
        <main>
          <p className="font-sans text-sm font-bold text-[#18794E]">ARTLANTIX</p>
          <h1 className="mt-3 text-3xl font-bold">Something went wrong.</h1>
          <p className="mt-3 text-sm text-[#666666]">Your work has not been submitted. Please try again.</p>
          <button onClick={reset} className="mt-6 rounded-lg bg-[#18794E] px-5 py-3 text-sm font-bold text-white hover:bg-[#115C3B]">Try again</button>
        </main>
      </body>
    </html>
  );
}

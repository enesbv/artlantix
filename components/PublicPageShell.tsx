import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PublicPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-ink">
      <Navbar />
      <div id="main">{children}</div>
      <Footer />
    </div>
  );
}

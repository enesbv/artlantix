import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PublicPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#141414]">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

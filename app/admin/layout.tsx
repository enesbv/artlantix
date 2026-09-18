'use client';

import React, { useEffect, useState } from 'react';
import AccessGate from '@/components/AccessGate';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { getCurrentUser } from '@/lib/services/auth';
import { UserProfile } from '@/lib/types';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const u = await getCurrentUser();
        setCurrentUser(u);
      } catch {
        // silent catch
      }
    }
    load();
  }, []);

  return (
    <AccessGate admin>
      <div className="min-h-screen bg-[#F7F6F2] text-[#141414]">
        <AdminSidebar
          currentUser={currentUser}
        />
        <div className="flex min-h-screen w-full min-w-0 flex-col lg:pl-64">
          {children}
        </div>
      </div>
    </AccessGate>
  );
}

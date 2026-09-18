'use client';

import React, { useEffect, useState } from 'react';
import AccessGate from '@/components/AccessGate';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { getCurrentUser } from '@/lib/services/auth';
import { getOrders } from '@/lib/services/orders';
import { UserProfile } from '@/lib/types';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const u = await getCurrentUser();
        setCurrentUser(u);
        const list = await getOrders(undefined, true, false);
        const pending = list.filter((o) => ['quote_requested', 'in_review'].includes(o.status)).length;
        setReviewCount(pending);
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
          ordersNeedingReviewCount={reviewCount}
        />
        <div className="pl-64 flex min-h-screen flex-col w-full min-w-0">
          {children}
        </div>
      </div>
    </AccessGate>
  );
}

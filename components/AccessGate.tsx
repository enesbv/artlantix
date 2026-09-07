'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/services/auth';

// UI routing only. Database RLS must independently protect every remote operation.
export default function AccessGate({ children, admin = false }: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowedPath, setAllowedPath] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    getCurrentUser().then((user) => {
      if (!active) return;
      if (!user) router.replace('/login');
      else if (admin && !user.is_admin) router.replace('/dashboard');
      else setAllowedPath(pathname);
    }).catch(() => { if (active) router.replace('/login'); });
    return () => { active = false; };
  }, [admin, pathname, router]);
  if (allowedPath !== pathname) return <p role="status" className="p-8 text-sm">Checking account access…</p>;
  return children;
}

'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navbar } from './navbar';
import { Footer } from './footer';

export function NavbarFooterWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const isDashboard = pathname?.startsWith('/dashboard') ?? false;
  const isAdmin = pathname?.startsWith('/admin') ?? false;
  const showNavbarFooter = !isDashboard && !isAdmin;

  return (
    <>
      {showNavbarFooter && <Navbar />}
      {children}
      {showNavbarFooter && <Footer />}
    </>
  );
}
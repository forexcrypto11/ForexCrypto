import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { NavbarFooterWrapper } from '@/components/navbar-footer-wrapper';
import { AuthProvider } from './auth-context';

export const metadata: Metadata = {
  title: 'ForexCrypto - Forex Trading Platform',
  description: 'Professional forex trading platform with real-time market data, and advanced trading tools.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark">
          <AuthProvider>
            <div className="relative flex min-h-screen flex-col">
              <NavbarFooterWrapper>
                <main className="flex-1">{children}</main>
              </NavbarFooterWrapper>
            </div>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
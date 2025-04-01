import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { NavbarFooterWrapper } from '@/components/navbar-footer-wrapper';
import { AuthProvider } from './auth-context';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={`${inter.className} min-h-screen bg-background`}>
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
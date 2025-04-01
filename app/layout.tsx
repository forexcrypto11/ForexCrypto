// import './globals.css';
// import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
// import { ThemeProvider } from '@/components/theme-provider';
// import { Navbar } from '@/components/navbar';
// import { Footer } from '@/components/footer';
// import { Toaster } from '@/components/ui/toaster';
// import DashboardPage from './dashboard/page';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: 'ForexPro - AI-Powered Forex Trading Platform',
//   description: 'Professional forex trading platform with AI-powered signals, real-time market data, and advanced trading tools.',
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className={`${inter.className} min-h-screen bg-background`}>
//         <ThemeProvider attribute="class" defaultTheme="dark">
//           <div className="relative flex min-h-screen flex-col">
//           {/* {!DashboardPage && <Navbar />} */}
//           <Navbar />
//             <main className="flex-1">{children}</main>
//             {/* {!DashboardPage && <Footer />} */}
//             <Footer />
//           </div>
//           <Toaster />
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }

// 'use client';

// import './globals.css';
// import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
// import { ThemeProvider } from '@/components/theme-provider';
// import { Navbar } from '@/components/navbar';
// import { Footer } from '@/components/footer';
// import { Toaster } from '@/components/ui/toaster';
// import { usePathname } from 'next/navigation';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: 'ForexPro - AI-Powered Forex Trading Platform',
//   description: 'Professional forex trading platform with AI-powered signals, real-time market data, and advanced trading tools.',
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const pathname = usePathname(); // Get current route
//   const isDashboard = pathname.startsWith('/dashboard'); // Check if it's the dashboard page

//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className={`${inter.className} min-h-screen bg-background`}>
//         <ThemeProvider attribute="class" defaultTheme="dark">
//           <div className="relative flex min-h-screen flex-col">
//             {!isDashboard && <Navbar />}
//             <main className="flex-1">{children}</main>
//             {!isDashboard && <Footer />}
//           </div>
//           <Toaster />
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }


import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { NavbarFooterWrapper } from '@/components/navbar-footer-wrapper';
import { AuthProvider } from './auth-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ForexPro - AI-Powered Forex Trading Platform',
  description: 'Professional forex trading platform with AI-powered signals, real-time market data, and advanced trading tools.',
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
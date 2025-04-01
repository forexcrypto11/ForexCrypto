"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LineChart, Wallet, BookOpen, BarChart3, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { href: "/about", label: "About Us", isPage: true },
    { href: "#benefits", label: "Benefits" },
    { href: "/live-chart", label: "Live Chart" },
    { href: "#features", label: "Features" },
    { href: "#contact", label: "Contact" },
  ];

  const handleScroll = (href: string, isPage: boolean = false) => {
    if (isPage) {
      router.push(href);
      setIsMobileMenuOpen(false);
      return;
    }
    
    if (window.location.pathname === "/") {
      // Smooth scroll on homepage
      const section = document.querySelector(href);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Navigate to homepage then scroll
      router.push(`/${href}`);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-[100] w-full transition-all duration-200",
          isScrolled
            ? "bg-background/95 backdrop-blur-lg shadow-sm"
            : "bg-background/50 backdrop-blur-sm"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 shrink-0">
              <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              <span className="text-lg md:text-2xl font-bold">ForexCrypto</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center justify-center flex-1 space-x-4 xl:space-x-6">
              {menuItems.map((item) => (
                item.isPage ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-base xl:text-lg hover:text-primary transition-colors cursor-pointer"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleScroll(item.href);
                    }}
                    className="text-base xl:text-lg hover:text-primary transition-colors cursor-pointer"
                  >
                    {item.label}
                  </a>
                )
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-2 md:space-x-4 shrink-0">
              <Button 
                variant="ghost" 
                className="hidden lg:inline-flex text-base"
                asChild
              >
                <Link href="/login">Log In</Link>
              </Button>
              <Button 
                className="hidden lg:inline-flex text-base bg-primary hover:bg-primary/90"
                asChild
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden z-[110]"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[105] bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-[105] h-screen bg-background shadow-xl"
        >
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <Link 
                  href="/" 
                  className="flex items-center space-x-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">ForexCrypto</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* Mobile Menu Content */}
              <div className="flex-1 overflow-y-auto">
                <nav className="flex flex-col items-center py-8 space-y-6">
                  {menuItems.map((item) => (
                    item.isPage ? (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-xl hover:text-primary transition-colors cursor-pointer"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleScroll(item.href);
                        }}
                        className="text-xl hover:text-primary transition-colors cursor-pointer"
                      >
                        {item.label}
                      </a>
                    )
                  ))}
                </nav>
              </div>

              {/* Mobile Menu Footer */}
              <div className="p-4 border-t">
                <div className="flex flex-col space-y-2 max-w-sm mx-auto w-full">
                  <Button variant="outline" className="w-full text-lg" asChild>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      Log In
                    </Link>
                  </Button>
                  <Button className="w-full text-lg bg-primary hover:bg-primary/90" asChild>
                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

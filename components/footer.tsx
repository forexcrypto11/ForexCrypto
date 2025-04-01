import Link from "next/link";
import { Twitter, Facebook, Linkedin, Instagram, Youtube, BarChart3 } from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="relative border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:54px_64px]" />
      
      <div className="container px-4 py-10 relative max-w-6xl mx-auto">
        {/* Logo and Branding */}
        <div className="flex flex-col items-center mb-8 space-y-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            ForexCrypto
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center max-w-5xl mx-auto">
          {/* Quick Links */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-base">Home</Link></li>
              <li><Link href="#about" className="text-muted-foreground hover:text-primary transition-colors text-base">About</Link></li>
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-base">Blog</Link></li>
              <li><Link href="#contact" className="text-muted-foreground hover:text-primary transition-colors text-base">Contact</Link></li>
            </ul>
          </div>
          
          {/* Legal */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-base">Privacy Policy</Link></li>
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-base">Terms & Conditions</Link></li>
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-base">Risk Disclaimer</Link></li>
            </ul>
          </div>
          
          {/* Support */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-base">FAQs</Link></li>
              <li><Link href="#contact" className="text-muted-foreground hover:text-primary transition-colors text-base">Help Center</Link></li>
              <li><Link href="#contact" className="text-muted-foreground hover:text-primary transition-colors text-base">Contact Support</Link></li>
            </ul>
          </div>
          
          {/* Connect */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-4">Connect With Us</h3>
            <div className="flex justify-center space-x-6 mb-5">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-6 w-6" />
              </Link>
            </div>
            
            <div className="mt-3">
              <h4 className="text-sm font-semibold mb-2">Payment Methods</h4>
              <div className="flex flex-wrap gap-3 justify-center">
                <div className="bg-card/50 backdrop-blur-sm p-2 rounded">
                  <Image 
                    src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/visa.svg" 
                    alt="Visa" 
                    width={20} 
                    height={20} 
                    className="h-6 w-6 invert" 
                  />
                </div>
                <div className="bg-card/50 backdrop-blur-sm p-2 rounded">
                  <Image 
                    src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/mastercard.svg" 
                    alt="Mastercard" 
                    width={20} 
                    height={20} 
                    className="h-6 w-6 invert" 
                  />
                </div>
                <div className="bg-card/50 backdrop-blur-sm p-2 rounded">
                  <Image 
                    src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/paypal.svg" 
                    alt="PayPal" 
                    width={20} 
                    height={20} 
                    className="h-6 w-6 invert" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-5 border-t border-border/40">
          <p className="text-center text-muted-foreground text-sm">
            © {new Date().getFullYear()} ForexCrypto. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
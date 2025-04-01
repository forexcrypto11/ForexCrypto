"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BarChart,
  Wallet,
  History,
  CircleDollarSign,
  ArrowDownUp,
  HandCoins,
  Settings,
  Lock,
  Menu,
  X,
  FileText
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "Live Charts", href: "/admin/livechart", icon: <BarChart className="h-5 w-5" /> },
    { name: "Order Requests", href: "/admin/order-requests", icon: <FileText className="h-5 w-5" /> },
    { name: "New Users Request", href: "/admin/new-request", icon: <History className="h-5 w-5" /> },
    { name: "Withdraw Requests", href: "/admin/withdraw-request", icon: <Wallet className="h-5 w-5" /> },
    { name: "Deposit Requests", href: "/admin/deposit-verification", icon: <Wallet className="h-5 w-5" /> },
    { name: "Order History", href: "/admin/order-history", icon: <History className="h-5 w-5" /> },
    { name: "Loan Requests", href: "/admin/loan-request-users", icon: <HandCoins className="h-5 w-5" /> },
    { name: "Total Users", href: "/admin/total-users", icon: <CircleDollarSign className="h-5 w-5" /> },
    // { name: "Transactions", href: "/admin/transaction", icon: <ArrowDownUp className="h-5 w-5" /> },
    { name: "Account Settings", href: "/admin/account-setting", icon: <Settings className="h-5 w-5" /> },
    { name: "Change Password", href: "/admin/change-password", icon: <Lock className="h-5 w-5" /> },
  ];

  const handleLinkClick = () => {
    if (isMobile) setIsOpen(false);
  };

  return (
    <>

<button
  onClick={() => setIsOpen(!isOpen)}
  data-menu-button
  className={`fixed top-4 left-4 z-50 p-2 rounded-lg bg-background border shadow-sm transition-opacity duration-300 ${
    isOpen ? 'opacity-0' : 'opacity-100'
  } lg:hidden`}
>
  <Menu className="h-6 w-6" />
</button>

      <motion.nav
        initial={false}
        animate={{ 
          x: isOpen ? 0 : (isMobile ? "-100%" : 0),
          opacity: isOpen ? 1 : (isMobile ? 0 : 1)
        }}
        transition={{ type: "tween", duration: 0.3 }}
        className="fixed left-0 top-0 h-screen w-72 border-r bg-background/95 backdrop-blur-lg z-40 shadow-lg"
      >
        <div className="h-16 px-6 border-b flex justify-between items-center bg-card">
          <h1 className="text-2xl font-bold text-primary">ForexCrypto</h1>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-1 hover:bg-accent rounded"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="py-4 space-y-1 h-[calc(100vh-4rem)] overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 mx-3 px-4 h-12 rounded-lg transition-all ${
                pathname === item.href
                  ? "bg-primary/10 text-primary font-semibold"
                  : "hover:bg-accent/50"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </motion.nav>
    </>
  );
} 
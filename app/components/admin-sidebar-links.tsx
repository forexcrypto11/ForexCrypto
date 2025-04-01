 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  ArrowDownUp, 
  LineChart, 
  Settings, 
  PiggyBank,
  ArrowDownCircle,
  History,
  CheckCircle
} from "lucide-react";

export type SidebarLink = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

export const adminLinks: SidebarLink[] = [
  { name: "Dashboard", href: "/admin", icon: <LineChart className="h-5 w-5" /> },
  { name: "All Users", href: "/admin/all-users", icon: <Users className="h-5 w-5" /> },
  { name: "Withdraw Requests", href: "/admin/withdraw-request", icon: <ArrowDownCircle className="h-5 w-5" /> },
  { name: "Deposit Requests", href: "/admin/deposit-verification", icon: <ArrowDownCircle className="h-5 w-5" /> },
  { name: "Order History", href: "/admin/order-history", icon: <History className="h-5 w-5" /> },
  { name: "Deposit Verification", href: "/admin/deposit-verification", icon: <CheckCircle className="h-5 w-5" /> },
  { name: "Transactions", href: "/admin/transaction", icon: <ArrowDownUp className="h-5 w-5" /> },
  { name: "Account Settings", href: "/admin/account-setting", icon: <Settings className="h-5 w-5" /> },
];

export default function AdminSidebarLinks() {
  const pathname = usePathname();
  
  return (
    <div className="space-y-1">
      {adminLinks.map((link) => {
        const isActive = pathname === link.href;
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-muted text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <span className={`mr-3 ${isActive ? 'text-primary' : ''}`}>
              {link.icon}
            </span>
            {link.name}
          </Link>
        );
      })}
    </div>
  );
}
'use client';
import { motion } from "framer-motion";
import { Bell, UserCircle, CheckCircle2, AlertTriangle, IndianRupee  } from "lucide-react";
import { useState } from "react";
import { Menu, Transition } from '@headlessui/react'
import { ChevronDown, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/app/auth-context';
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/components/ui/loading-overlay";

type Notification = {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  type: 'success' | 'warning' | 'info';
};

export function Header() {
  const { logout, name } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications] = useState<Notification[]>([]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      console.log("loggedout")
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {isLoggingOut && <LoadingOverlay message="Logging out..." />}
      <motion.header
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="sticky top-0 border-b bg-background/80 backdrop-blur-lg z-30 h-16"
      >
        <div className="h-full flex items-center justify-between px-6 border-x">
          {/* Welcome message with responsive hiding */}
          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold">
              Welcome {name || 'Trader'} !
            </h1>
          </div>

          {/* Empty div for small screens to maintain right alignment */}
          <div className="lg:hidden flex-1"></div>

          {/* Notifications and Profile section */}
          <div className="flex items-center gap-2 ml-auto">
            <Menu as="div" className="relative">
              <Menu.Button className="hover:bg-accent rounded-full p-2">
                <div className="relative">
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-background" />
                  )}
                </div>
              </Menu.Button>

              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right divide-y divide-border rounded-md bg-background/95 backdrop-blur-lg shadow-lg ring-1 ring-border focus:outline-none">
                  <div className="p-2">
                    <div className="flex justify-between items-center px-2 py-1">
                      <h3 className="font-semibold">Notifications</h3>
                      <button className="text-primary text-sm hover:underline">
                        Mark all as read
                      </button>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-3 text-center text-muted-foreground">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <Menu.Item key={notification.id}>
                            {({ active }) => (
                              <div className={`p-3 space-y-1 rounded-md ${
                                active ? 'bg-accent' : ''
                              }`}>
                                <div className="flex items-start gap-3">
                                  <div className="shrink-0 pt-1">
                                    {notification.type === 'success' ? (
                                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                                    ) : notification.type === 'warning' ? (
                                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                                    ) : (
                                     <IndianRupee  className="h-5 w-5 text-blue-400" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium">{notification.title}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {notification.message}
                                    </p>
                                    <time className="text-xs text-muted-foreground/80">
                                      {notification.timestamp}
                                    </time>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Menu.Item>
                        ))
                      )}
                    </div>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
            
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-1 hover:bg-accent rounded-full p-1">
                <UserCircle className="h-8 w-8 text-muted-foreground" />
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Menu.Button>

              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-border rounded-md bg-background/95 backdrop-blur-lg shadow-lg ring-1 ring-border focus:outline-none">
                  <div className="p-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="/dashboard/account-setting"
                          className={`${
                            active ? 'bg-accent' : ''
                          } group flex w-full items-center rounded-md px-4 py-2 text-sm`}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Account Settings
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-accent' : ''
                          } group flex w-full items-center rounded-md px-4 py-2 text-sm`}
                          disabled={isLoggingOut}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </button>
                      )}
                    </Menu.Item>      
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </motion.header>
    </>
  );
}
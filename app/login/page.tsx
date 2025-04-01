"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ArrowRight, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-context";
import LoadingOverlay from "@/components/ui/loading-overlay";

function LoginPage() {
  const [showPasswords, setShowPasswords] = useState({
    password: false,
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setAuth, isLoading, email } = useAuth();
  const router = useRouter();

  // Pre-fill form from cookies instead of redirecting
  useEffect(() => {
    if (!isLoading && email) {
      setUsername(email);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (!data.user.isVerified) {
          router.push("/account-not-verified");
          return;
        }
        
        // Include name when setting auth
        setAuth(data.user.id, data.user.email, data.user.name, data.user.role);
        
        if (data.user.role === 'admin') {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(data.error || "An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field: 'password') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Show loading state
  if (isLoading) {
    return <LoadingOverlay message="Loading user information..." />;
  }

  return (
    <div className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-14">
      {isSubmitting && <LoadingOverlay message="Signing in..." />}
      <div className="container px-4 mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md mx-auto"
        >
          {/* Logo and Heading */}
          <div className="flex flex-col items-center mb-8">
            <BarChart3 className="h-8 w-8 text-primary mb-4" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-green-400">
              Welcome Back !! 
            </h1>
            <p className="text-muted-foreground mt-2">Sign in to continue</p>
          </div>

          {/* Login Form */}
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-8 border border-border shadow-xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email or Username
                </label>
                <Input
                  type="text"
                  placeholder="Enter your email"
                  className="bg-background/70 border-green-500/20 focus:border-green-500/50 focus:ring-green-500/30"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords.password ? "text" : "password"}
                    placeholder="Enter your password"
                    className="bg-background/70 border-green-500/20 focus:border-green-500/50 focus:ring-green-500/30 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('password')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.password ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                <div className="text-right mt-2">
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 font-semibold"
                disabled={isSubmitting}
              >
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-primary hover:text-green-600 transition-colors font-medium"
              >
                Sign up here
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-green-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-blue-500/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}

export default LoginPage;
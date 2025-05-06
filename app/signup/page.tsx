"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ArrowRight, BarChart3 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from '../auth-context';
import { useRouter } from 'next/navigation';
import LoadingOverlay from "@/components/ui/loading-overlay";

const SignupForm = () => {
  const [showPasswords, setShowPasswords] = useState({
    password: false,
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    gender: "",
    phone: "",
    aadharNo: "",
    dob: "",
    address: "",
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
    pan: "",
    nomineeName: "",
    nomineeRelation: "",
    nomineeDob: "",
  });

  const { setAuth } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/user/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        router.push('/pending-approval');
      } else {
        const errorData = await response.json();
        console.error('Signup error:', errorData);
        // Handle error state
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error state
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = (field: 'password') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden pt-24">
      {isSubmitting && <LoadingOverlay message="Creating your account..." />}
      
      {/* Trading Graph Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" />
        <Image
          src="/assets/bull.png"
          alt="Trading background"
          fill
          className="object-cover opacity-20"
          priority
        />
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header Section */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center mb-6"
            >
              <BarChart3 className="h-8 w-8 text-primary mb-4" />
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-green-400">
                Get Started Now
              </h1>
            </motion.div>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Join our platform to access advanced trading tools, real-time market data, 
              and professional trading resources.
            </p>
          </div>

          {/* Signup Form */}
          <div className="bg-card/70 backdrop-blur-lg rounded-xl p-8 border border-green-500/20 shadow-2xl shadow-green-500/10 mb-12">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-primary mb-5">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="bg-background/80 border-green-500/30 focus:border-green-500/50"
                  />
                  <Input
                    placeholder="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="bg-background/80 border-green-500/30 focus:border-green-500/50"
                  />
                </div>
                <Input
                  placeholder="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-background/80 border-green-500/30 focus:border-green-500/50"
                />
                <Input
                  placeholder="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="bg-background/80 border-green-500/30 focus:border-green-500/50"
                />
                <div className="relative">
                  <Input
                    type={showPasswords.password ? "text" : "password"}
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="bg-background/80 border-green-500/30 focus:border-green-500/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('password')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.password ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <Input
                  placeholder="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="bg-background/80 border-green-500/30 focus:border-green-500/50"
                />
                <Input
                  placeholder="Mobile Number"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="bg-background/80 border-green-500/30 focus:border-green-500/50"
                />
                <Input
                  placeholder="Aadhar Number"
                  name="aadharNo"
                  value={formData.aadharNo}
                  onChange={handleInputChange}
                  className="bg-background/80 border-green-500/30 focus:border-green-500/50"
                />
                <Input
                  placeholder="Date of Birth"
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="bg-background/80 border-green-500/30 focus:border-green-500/50"
                />
                <Input
                  placeholder="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="bg-background/80 border-green-500/30 focus:border-green-500/50"
                />
              </div>

              {/* Bank & Nominee Details */}
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-primary mb-5">Bank Details</h3>
                <Input
                  placeholder="Bank Name"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className="bg-background/80 border-green-500/30 focus:border-green-500/50"
                />
                <Input
                  placeholder="Account Holder Name"
                  name="accountHolder"
                  value={formData.accountHolder}
                  onChange={handleInputChange}
                  className="bg-background/80 border-green-500/30 focus:border-green-500/50"
                />
                <Input
                  placeholder="Account Number"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  className="bg-background/80 border-green-500/30 focus:border-green-500/50"
                />
                <Input
                  placeholder="IFSC Code"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  className="bg-background/80 border-green-500/30 focus:border-green-500/50"
                />
                <Input
                  placeholder="PAN Number"
                  name="pan"
                  value={formData.pan}
                  onChange={handleInputChange}
                  className="bg-background/80 border-green-500/30 focus:border-green-500/50"
                />

                <h3 className="text-xl font-semibold text-primary mt-8 mb-5">Nominee Details</h3>
                <Input
                  placeholder="Nominee Name"
                  name="nomineeName"
                  value={formData.nomineeName}
                  onChange={handleInputChange}
                  className="bg-background/80 border-green-500/30 focus:border-green-500/50"
                />
                <Input
                  placeholder="Nominee Relation"
                  name="nomineeRelation"
                  value={formData.nomineeRelation}
                  onChange={handleInputChange}
                  className="bg-background/80 border-green-500/30 focus:border-green-500/50"
                />
                <Input
                  placeholder="Nominee Date of Birth"
                  type="date"
                  name="nomineeDob"
                  value={formData.nomineeDob}
                  onChange={handleInputChange}
                  className="bg-background/80 border-green-500/30 focus:border-green-500/50"
                />
              </div>

              {/* Terms & Submit Section */}
              <div className="md:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-green-500/20">
                <label className="flex items-center space-x-2 order-2 sm:order-1">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="h-4 w-4 text-primary rounded border-green-500/30 focus:ring-green-500/50"
                  />
                  <span className="text-sm text-muted-foreground">
                    I agree to the <Link href="#" className="text-primary hover:underline">Terms & Conditions</Link>
                  </span>
                </label>
                
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-green-500 hover:bg-green-600 font-semibold px-8 py-6 order-1 sm:order-2"
                  disabled={isSubmitting || !agreeTerms}
                >
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:text-green-600 font-medium">
                Sign in here
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
};

export default SignupForm;
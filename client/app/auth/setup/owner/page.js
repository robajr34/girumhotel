"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";

export default function OwnerSetupPage() {
  const { setupOwner } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdEmail, setCreatedEmail] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errs.password = "Password is required";
    } else if (formData.password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await setupOwner({
        email: formData.email.trim(),
        password: formData.password,
      });
      setCreatedEmail(formData.email.trim());
    } catch (err) {
      // Handled by AuthContext toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="w-full max-w-lg">
        {/* Wizard Steps Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className="text-[#8c6838]">1. Create Owner</span>
            <span className={createdEmail ? "text-[#8c6838]" : ""}>2. Email Verification</span>
            <span>3. Complete Profile</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-1.5 rounded-full bg-[#b48c58]" />
            <div className={`h-1.5 rounded-full ${createdEmail ? "bg-[#b48c58]" : "bg-slate-200"}`} />
            <div className="h-1.5 rounded-full bg-slate-200" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 sm:p-8">
          {!createdEmail ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#8c6838] flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    Owner Initial Setup
                  </h1>
                  <p className="text-xs text-slate-500">
                    Create the primary administrator account for this hotel
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Input
                  label="Owner Email Address"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="owner@hotel.com"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  error={errors.email}
                  leftIcon={<Mail className="h-4 w-4" />}
                />

                <div>
                  <Input
                    label="Master Password"
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    required
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: null });
                    }}
                    error={errors.password}
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
                  />
                </div>

                <div>
                  <Input
                    label="Confirm Master Password"
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Re-enter master password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value });
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                    }}
                    error={errors.confirmPassword}
                    leftIcon={<Lock className="h-4 w-4" />}
                  />
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full mt-2"
                  isLoading={isSubmitting}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Create Owner Account
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Verification Email Sent
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                An activation link has been sent to{" "}
                <strong className="text-slate-800">{createdEmail}</strong>. Please check your inbox or copy the token from the email.
              </p>
              <div className="pt-4 flex flex-col gap-2">
                <Button
                  variant="primary"
                  onClick={() => router.push("/auth/setup/owner/verify")}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Enter Verification Token
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            Already completed setup?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-slate-900 hover:underline"
            >
              Log in to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

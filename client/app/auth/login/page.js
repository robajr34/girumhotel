"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Mail, Lock, Eye, EyeOff, Hotel, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errs.password = "Password is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });
    } catch (err) {
      // Handled by AuthContext toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs mb-4 hover:border-slate-300 transition-colors"
          >
            <div className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center text-white">
              <Hotel className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-800">
              Grand Horizon
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="text-xs text-slate-500 mt-1.5">
            Sign in to your account to manage bookings or operations
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email Address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@hotel.com"
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
                label="Password"
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-3 text-center text-xs text-slate-500">
            <div>
              Don&apos;t have a guest account?{" "}
              <Link
                href="/auth/signup"
                className="font-semibold text-slate-900 hover:underline"
              >
                Sign up here
              </Link>
            </div>
            <div className="pt-2 border-t border-slate-50">
              Setting up the hotel for the first time?{" "}
              <Link
                href="/auth/setup/owner"
                className="font-semibold text-[#8c6838] hover:underline"
              >
                Owner initial setup
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

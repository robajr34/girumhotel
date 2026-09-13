"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HOTEL } from "@/constants/hotel";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Hotel,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";

export default function SignupPage() {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
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
      await signup({
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
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
              <Image
                src={HOTEL.logo}
                alt={`${HOTEL.websiteName} logo`}
                width={38}
                height={38}
                className="w-full h-full object-cover"
              />
            </div>

            <span className="text-xs font-semibold tracking-wider uppercase text-slate-800">
              {HOTEL.websiteName}
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create Guest Account
          </h1>
          <p className="text-xs text-slate-500 mt-1.5">
            Book rooms faster and view your reservation history seamlessly
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email Address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="guest@example.com"
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
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
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
                label="Confirm Password"
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                required
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  if (errors.confirmPassword)
                    setErrors({ ...errors, confirmPassword: null });
                }}
                error={errors.confirmPassword}
                leftIcon={<Lock className="h-4 w-4" />}
              />
            </div>

            {/* Password checklist */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2
                  className={`h-3.5 w-3.5 ${
                    formData.password.length >= 8
                      ? "text-emerald-500"
                      : "text-slate-300"
                  }`}
                />
                <span>Minimum 8 characters</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-slate-900 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

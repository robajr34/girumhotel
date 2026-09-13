"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { KeyRound, Lock, Eye, EyeOff, User, Phone, CheckCircle2, ArrowRight } from "lucide-react";
import Image from "next/image";
import { HOTEL } from "@/constants/hotel";

function StaffVerifyContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token") || "";

  const { verifyStaffEmail, completeSetup } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1); // 1 = Set Password & Verify, 2 = Complete Staff Profile
  const [tokenInput, setTokenInput] = useState(tokenParam);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [profileErrors, setProfileErrors] = useState({});

  useEffect(() => {
    if (tokenParam) {
      setTokenInput(tokenParam);
    }
  }, [tokenParam]);

  const validateStep1 = () => {
    const errs = {};
    if (!tokenInput.trim()) errs.token = "Verification token is required";
    if (!password) {
      errs.password = "Please create a password";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleVerifyStaff = async (e) => {
    e.preventDefault();
    if (!validateStep1()) return;

    try {
      setIsVerifying(true);
      await verifyStaffEmail({
        token: tokenInput.trim(),
        password,
      });
      setStep(2);
    } catch (err) {
      // Handled by AuthContext toast
    } finally {
      setIsVerifying(false);
    }
  };

  const validateProfile = () => {
    const errs = {};
    if (!profileData.firstName.trim()) errs.firstName = "First name is required";
    if (!profileData.lastName.trim()) errs.lastName = "Last name is required";
    if (!profileData.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (profileData.phone.trim().length < 7) {
      errs.phone = "Please enter a valid phone number";
    }

    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    try {
      setIsSubmittingProfile(true);
      await completeSetup({
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        phone: profileData.phone.trim(),
      });
    } catch (err) {
      // Handled by AuthContext toast
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="w-full max-w-lg">
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

            <span className="text-xs md:text-sm font-semibold tracking-wider uppercase text-slate-800">
              {HOTEL.websiteName}
            </span>
          </Link>
        </div>
        {/* Wizard Steps Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className="text-[#8c6838]">1. Activate Invitation</span>
            <span className={step >= 2 ? "text-[#8c6838]" : ""}>
              2. Staff Profile
            </span>
            <span>3. Get Started</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-1.5 rounded-full bg-[#b48c58]" />
            <div
              className={`h-1.5 rounded-full ${step >= 2 ? "bg-[#b48c58]" : "bg-slate-200"}`}
            />
            <div className="h-1.5 rounded-full bg-slate-200" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 sm:p-8">
          {step === 1 ? (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#8c6838] flex items-center justify-center">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    Activate Staff Account
                  </h1>
                  <p className="text-xs text-slate-500">
                    Verify your invitation token and create your secure password
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleVerifyStaff}
                className="space-y-4"
                noValidate
              >
                <Input
                  label="Invitation Token"
                  id="token"
                  placeholder="Paste invitation token..."
                  required
                  value={tokenInput}
                  onChange={(e) => {
                    setTokenInput(e.target.value);
                    if (errors.token) setErrors({ ...errors, token: null });
                  }}
                  error={errors.token}
                  leftIcon={<KeyRound className="h-4 w-4" />}
                />

                <Input
                  label="Create Password"
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors({ ...errors, password: null });
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

                <Input
                  label="Confirm Password"
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword)
                      setErrors({ ...errors, confirmPassword: null });
                  }}
                  error={errors.confirmPassword}
                  leftIcon={<Lock className="h-4 w-4" />}
                />

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full mt-2"
                  isLoading={isVerifying}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Activate & Continue
                </Button>
              </form>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    Complete Staff Profile
                  </h1>
                  <p className="text-xs text-slate-500">
                    Enter your name and contact number for hotel records
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleCompleteProfile}
                className="space-y-4"
                noValidate
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    id="firstName"
                    name="firstName"
                    placeholder="e.g. Sara"
                    required
                    value={profileData.firstName}
                    onChange={(e) => {
                      setProfileData({
                        ...profileData,
                        firstName: e.target.value,
                      });
                      if (profileErrors.firstName)
                        setProfileErrors({ ...profileErrors, firstName: null });
                    }}
                    error={profileErrors.firstName}
                    leftIcon={<User className="h-4 w-4" />}
                  />

                  <Input
                    label="Last Name"
                    id="lastName"
                    name="lastName"
                    placeholder="e.g. Mengistu"
                    required
                    value={profileData.lastName}
                    onChange={(e) => {
                      setProfileData({
                        ...profileData,
                        lastName: e.target.value,
                      });
                      if (profileErrors.lastName)
                        setProfileErrors({ ...profileErrors, lastName: null });
                    }}
                    error={profileErrors.lastName}
                    leftIcon={<User className="h-4 w-4" />}
                  />
                </div>

                <Input
                  label="Phone Number"
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="e.g. +251 912 345678"
                  required
                  value={profileData.phone}
                  onChange={(e) => {
                    setProfileData({ ...profileData, phone: e.target.value });
                    if (profileErrors.phone)
                      setProfileErrors({ ...profileErrors, phone: null });
                  }}
                  error={profileErrors.phone}
                  leftIcon={<Phone className="h-4 w-4" />}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                  isLoading={isSubmittingProfile}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Complete Setup & Open Workspace
                </Button>
              </form>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            Already activated?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-slate-900 hover:underline"
            >
              Sign in to hotel portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StaffVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xs text-slate-400">Loading staff invitation wizard...</p>
        </div>
      }
    >
      <StaffVerifyContent />
    </Suspense>
  );
}

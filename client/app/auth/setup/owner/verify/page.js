"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { KeyRound, User, Phone, CheckCircle2, ArrowRight } from "lucide-react";
import { scrollToFirstError } from "@/utils/scrollToFormError";

function OwnerVerifyContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token") || "";

  const { verifyOwnerEmail, completeSetup, user } = useAuth();

  const [step, setStep] = useState(1); // 1 = Verify Token, 2 = Complete Profile
  const [tokenInput, setTokenInput] = useState(tokenParam);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [profileErrors, setProfileErrors] = useState({});

  // Auto-verify if token is provided in URL
  useEffect(() => {
    if (tokenParam && step === 1) {
      handleVerifyToken(tokenParam);
    }
  }, [tokenParam]);

  const handleVerifyToken = async (tokenToVerify) => {
    const rawToken = tokenToVerify || tokenInput;
    if (!rawToken.trim()) return;

    try {
      setIsVerifying(true);
      await verifyOwnerEmail(rawToken.trim());
      setStep(2);
    } catch (err) {
      scrollToFirstError(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const validateProfile = () => {
    const errs = {};
    if (!profileData.firstName.trim())
      errs.firstName = "First name is required";
    if (!profileData.lastName.trim()) errs.lastName = "Last name is required";
    if (!profileData.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (profileData.phone.trim().length < 7) {
      errs.phone = "Please enter a valid phone number";
    }

    setProfileErrors(errs);
    if (Object.keys(errs).length > 0) {
      scrollToFirstError(errs);
      return false;
    }
    return true;
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
      scrollToFirstError(err);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="w-full max-w-lg">
        {/* Wizard Steps Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className="text-[#8c6838]">1. Create Owner</span>
            <span className={step >= 1 ? "text-[#8c6838]" : ""}>
              2. Email Verification
            </span>
            <span className={step >= 2 ? "text-[#8c6838]" : ""}>
              3. Complete Profile
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-1.5 rounded-full bg-[#b48c58]" />
            <div className="h-1.5 rounded-full bg-[#b48c58]" />
            <div
              className={`h-1.5 rounded-full ${step >= 2 ? "bg-[#b48c58]" : "bg-slate-200"}`}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 sm:p-8">
          {step === 1 ? (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#8c6838] flex items-center justify-center">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    Verify Owner Email
                  </h1>
                  <p className="text-xs text-slate-500">
                    Enter the verification token from your confirmation email
                  </p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerifyToken(tokenInput);
                }}
                className="space-y-4"
              >
                <Input
                  label="Verification Token"
                  id="token"
                  placeholder="Paste token here..."
                  required
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  leftIcon={<KeyRound className="h-4 w-4" />}
                  helperText="The token was generated when your owner account was created."
                />

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full mt-2"
                  isLoading={isVerifying}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Verify Token
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
                    Complete Owner Profile
                  </h1>
                  <p className="text-xs text-slate-500">
                    Enter your name and contact details to finalize setup
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
                    placeholder="e.g. Abebe"
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
                    placeholder="e.g. Kebede"
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
                  placeholder="e.g. +251 911 234567"
                  required
                  value={profileData.phone}
                  onChange={(e) => {
                    setProfileData({ ...profileData, phone: e.target.value });
                    if (profileErrors.phone)
                      setProfileErrors({ ...profileErrors, phone: null });
                  }}
                  error={profileErrors.phone}
                  leftIcon={<Phone className="h-4 w-4" />}
                  helperText="Used for hotel communications and emergency contacts."
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                  isLoading={isSubmittingProfile}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Complete Setup & Open Dashboard
                </Button>
              </form>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            Need to start over?{" "}
            <Link
              href="/auth/setup/owner"
              className="font-semibold text-[#8c6838] hover:underline"
            >
              Owner registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OwnerVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xs text-slate-400">
            Loading verification wizard...
          </p>
        </div>
      }
    >
      <OwnerVerifyContent />
    </Suspense>
  );
}

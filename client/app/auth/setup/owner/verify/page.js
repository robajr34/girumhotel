"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
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

  const { verifyOwnerEmail, completeSetup } = useAuth();

  const [step, setStep] = useState(1);
  const [tokenInput, setTokenInput] = useState(tokenParam);

  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  const [tokenError, setTokenError] = useState("");

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  const [profileErrors, setProfileErrors] = useState({});

  // Prevent duplicate automatic verification in React Strict Mode
  const hasAutoVerified = useRef(false);

  // Automatically verify token from URL
  useEffect(() => {
    if (!tokenParam || hasAutoVerified.current) return;

    hasAutoVerified.current = true;
    handleVerifyToken(tokenParam);
  }, [tokenParam]);

  const handleVerifyToken = async (tokenToVerify) => {
    const rawToken = tokenToVerify || tokenInput;

    if (!rawToken.trim()) {
      const error = {
        token: "Verification token is required.",
      };

      setTokenError(error.token);
      scrollToFirstError(error);
      return;
    }

    try {
      setIsVerifying(true);
      setTokenError("");

      await verifyOwnerEmail(rawToken.trim());

      setStep(2);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid or expired verification token.";

      const errors = {
        token: message,
      };

      setTokenError(message);
      scrollToFirstError(errors);
    } finally {
      setIsVerifying(false);
    }
  };

  const validateProfile = () => {
    const errors = {};

    if (!profileData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!profileData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!profileData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (profileData.phone.trim().length < 7) {
      errors.phone = "Please enter a valid phone number";
    }

    setProfileErrors(errors);

    if (Object.keys(errors).length > 0) {
      scrollToFirstError(errors);
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
      const errors = err?.response?.data?.errors || err?.errors || {};

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to complete setup.";

      // If backend returns field-level errors, use them.
      if (Object.keys(errors).length > 0) {
        setProfileErrors(errors);
        scrollToFirstError(errors);
      } else {
        // Otherwise preserve your existing API error handling.
        scrollToFirstError({
          firstName: message,
        });
      }
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

            <span className="text-[#8c6838]">2. Email Verification</span>

            <span className={step >= 2 ? "text-[#8c6838]" : "text-slate-400"}>
              3. Complete Profile
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="h-1.5 rounded-full bg-[#b48c58]" />

            <div className="h-1.5 rounded-full bg-[#b48c58]" />

            <div
              className={`h-1.5 rounded-full ${
                step >= 2 ? "bg-[#b48c58]" : "bg-slate-200"
              }`}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 sm:p-8">
          {step === 1 ? (
            <div>
              {/* Header */}
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

              {/* Token Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerifyToken(tokenInput);
                }}
                className="space-y-4"
                noValidate
              >
                <Input
                  label="Verification Token"
                  id="token"
                  name="token"
                  placeholder="Paste token here..."
                  required
                  value={tokenInput}
                  onChange={(e) => {
                    setTokenInput(e.target.value);

                    if (tokenError) {
                      setTokenError("");
                    }
                  }}
                  error={tokenError}
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
              {/* Header */}
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

              {/* Profile Form */}
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

                      if (profileErrors.firstName) {
                        setProfileErrors({
                          ...profileErrors,
                          firstName: null,
                        });
                      }
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

                      if (profileErrors.lastName) {
                        setProfileErrors({
                          ...profileErrors,
                          lastName: null,
                        });
                      }
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
                    setProfileData({
                      ...profileData,
                      phone: e.target.value,
                    });

                    if (profileErrors.phone) {
                      setProfileErrors({
                        ...profileErrors,
                        phone: null,
                      });
                    }
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

          {/* Footer */}
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

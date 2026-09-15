"use client";

import React, { useState } from "react";
import Input from "./Input";
import { Eye, EyeOff, Check, Circle, CheckCircle2, XCircle } from "lucide-react";
import { calculatePasswordStrength } from "@/utils/passwordStrength";

export default function PasswordInput({
  showStrength = false,
  matchPassword, // pass a string to enable confirm password mode
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const value = props.value || "";

  const toggleVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isConfirmMode = typeof matchPassword === "string";

  // Calculate strength only if needed
  const { score, label, requirements } = showStrength && !isConfirmMode
    ? calculatePasswordStrength(value)
    : { score: 0, label: "Empty", requirements: [] };

  const renderStrengthMeter = () => {
    if (!showStrength) return null;

    if (isConfirmMode) {
      if (!value) return null;
      const isMatch = value === matchPassword;
      return (
        <div className="mt-2 text-sm">
          {isMatch ? (
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <CheckCircle2 className="h-4 w-4" /> Passwords match
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-rose-600 font-medium">
              <XCircle className="h-4 w-4" /> Passwords do not match
            </span>
          )}
        </div>
      );
    }

    if (!value) {
      return (
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Password strength</span>
          </div>
          <div className="flex gap-1 h-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-1 bg-slate-100 rounded-full"></div>
            ))}
          </div>
        </div>
      );
    }

    // Determine segment colors based on score
    // 1,2 = Weak (rose), 3 = Fair (amber), 4 = Good (blue), 5 = Strong (emerald)
    let colorClass = "bg-rose-500";
    let activeSegments = 1;

    if (score >= 5) {
      colorClass = "bg-emerald-500";
      activeSegments = 4;
    } else if (score >= 4) {
      colorClass = "bg-blue-500";
      activeSegments = 3;
    } else if (score >= 3) {
      colorClass = "bg-amber-500";
      activeSegments = 2;
    } else if (score > 0) {
      colorClass = "bg-rose-500";
      activeSegments = 1;
    }

    return (
      <div className="mt-3 space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Password strength</span>
            <span className={`text-xs font-bold ${colorClass.replace("bg-", "text-")}`}>
              {label}
            </span>
          </div>
          <div className="flex gap-1 h-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all duration-300 ${
                  i <= activeSegments ? colorClass : "bg-slate-100"
                }`}
              ></div>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          {requirements.map((req) => (
            <div
              key={req.id}
              className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                req.met ? "text-emerald-600 font-medium" : "text-slate-500"
              }`}
            >
              {req.met ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
              {req.text}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <Input
        {...props}
        type={showPassword ? "text" : "password"}
        rightIcon={
          <button
            type="button"
            onClick={toggleVisibility}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
            tabIndex="-1"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
      />
      {renderStrengthMeter()}
    </div>
  );
}

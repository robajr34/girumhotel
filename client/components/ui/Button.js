"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = "",
  onClick,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer";

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5 min-h-[32px]",
    md: "text-sm px-4 py-2.5 gap-2 min-h-[40px]",
    lg: "text-base px-5 py-3 gap-2.5 min-h-[48px]",
  };

  const variantStyles = {
    primary:
      "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 focus:ring-slate-900 shadow-sm",
    secondary:
      "bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 focus:ring-slate-400",
    outline:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 focus:ring-slate-400 shadow-xs",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-500 shadow-sm",
    ghost:
      "text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-300",
    gold:
      "bg-[#b48c58] text-white hover:bg-[#9a7442] active:bg-[#856133] focus:ring-[#b48c58] shadow-sm",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-current" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

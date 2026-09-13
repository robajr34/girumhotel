import React from "react";

export default function Badge({
  children,
  variant,
  status,
  size = "md",
  className = "",
}) {
  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  // Status mapping for automatic styling
  const statusStyles = {
    // Room / Entity Statuses
    available: "bg-emerald-50 text-emerald-700 border-emerald-200",
    occupied: "bg-indigo-50 text-indigo-700 border-indigo-200",
    cleaning: "bg-amber-50 text-amber-700 border-amber-200",
    maintenance: "bg-orange-50 text-orange-700 border-orange-200",
    inactive: "bg-slate-100 text-slate-600 border-slate-200",

    // Booking Statuses
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    checked_in: "bg-blue-50 text-blue-700 border-blue-200",
    checked_out: "bg-slate-100 text-slate-600 border-slate-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",

    // Roles
    owner: "bg-purple-50 text-purple-700 border-purple-200",
    manager: "bg-blue-50 text-blue-700 border-blue-200",
    receptionist: "bg-teal-50 text-teal-700 border-teal-200",
    guest: "bg-slate-100 text-slate-700 border-slate-200",

    // Menu Categories
    breakfast: "bg-amber-50 text-amber-900 border-amber-300",
    lunch: "bg-emerald-50 text-emerald-900 border-emerald-300",
    dinner: "bg-indigo-50 text-indigo-900 border-indigo-300",
    meat: "bg-rose-50 text-rose-900 border-rose-300",
    beverage: "bg-cyan-50 text-cyan-900 border-cyan-300",
    alcohol: "bg-violet-50 text-violet-900 border-violet-300",
    hot_drink: "bg-orange-50 text-orange-900 border-orange-300",
    cake: "bg-fuchsia-50 text-fuchsia-900 border-fuchsia-300",
  };

  const variantStyles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    gold: "bg-[#fbf7f2] text-[#8c6838] border-[#e8d8c3]",
  };

  const style =
    (status && statusStyles[status.toLowerCase()]) ||
    (variant && variantStyles[variant]) ||
    variantStyles.neutral;

  const formatText = (text) => {
    if (typeof text !== "string") return text;
    return text.replace(/_/g, " ");
  };

  return (
    <span
      className={`inline-flex items-center font-medium capitalize rounded-lg border tracking-wide transition-colors ${
        sizeStyles[size] || sizeStyles.md
      } ${style} ${className}`}
    >
      {children || formatText(status)}
    </span>
  );
}

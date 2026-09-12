import React from "react";

export default function Card({
  children,
  className = "",
  hoverable = false,
  padding = "default",
  ...props
}) {
  const paddingStyles = {
    none: "",
    sm: "p-4",
    default: "p-5 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-card transition-all duration-200 ${
        hoverable ? "hover:border-slate-300 hover:shadow-card-hover" : ""
      } ${paddingStyles[padding] || paddingStyles.default} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", subtitle = null, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <h3
        className={`text-base font-semibold text-slate-900 tracking-tight ${className}`}
        {...props}
      >
        {children}
      </h3>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}

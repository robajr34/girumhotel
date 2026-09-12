"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

export default function Select({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  error,
  helperText,
  required = false,
  disabled = false,
  leftIcon = null,
  className = "",
  containerClassName = "",
  ...props
}) {
  const selectId = id || name || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold text-slate-700 tracking-wide flex items-center justify-between"
        >
          <span>
            {label} {required && <span className="text-rose-500">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}

        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`w-full text-sm bg-white rounded-xl border appearance-none transition-all duration-150 py-2.5 px-3.5 pr-10 text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer ${
            leftIcon ? "pl-10" : ""
          } ${
            error
              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
              : "border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-slate-100"
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const optVal = typeof opt === "object" ? opt.value : opt;
            const optLabel = typeof opt === "object" ? opt.label : opt;
            return (
              <option key={String(optVal)} value={optVal}>
                {optLabel}
              </option>
            );
          })}
        </select>

        <div className="absolute right-3.5 pointer-events-none text-slate-400 flex items-center">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>

      {error ? (
        <p className="text-xs text-rose-500 font-medium tracking-tight mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check } from "lucide-react";

/**
 * Modern SaaS-Quality Custom Select Component
 *
 * Provides a polished dropdown user experience with full keyboard accessibility,
 * ARIA roles, click-outside dismissal, responsive popover positioning, and
 * 100% backwards-compatible synthetic event emission.
 */
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
  menuClassName = "",
  ...props
}) {
  const generatedId = useId();
  const selectId = id || name || `select-${generatedId}`;
  const listboxId = `listbox-${selectId}`;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const listboxRef = useRef(null);

  // Normalize options array into standardized objects: { value, label, disabled }
  const normalizedOptions = options.map((opt) => {
    if (opt !== null && typeof opt === "object") {
      return {
        value: opt.value !== undefined ? opt.value : "",
        label: opt.label !== undefined ? String(opt.label) : String(opt.value),
        disabled: Boolean(opt.disabled),
      };
    }
    return {
      value: opt,
      label: String(opt),
      disabled: false,
    };
  });

  // Find currently selected option
  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Keep highlighted index in sync when opening menu
  useEffect(() => {
    if (isOpen) {
      const selectedIdx = normalizedOptions.findIndex(
        (opt) => String(opt.value) === String(value)
      );
      setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);
    }
  }, [isOpen, value, options]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listboxRef.current && highlightedIndex >= 0) {
      const optionEl = listboxRef.current.children[highlightedIndex];
      if (optionEl) {
        optionEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Emit synthetic event compatible with standard HTML event handlers
  const handleSelectOption = (option) => {
    if (option.disabled || disabled) return;

    setIsOpen(false);
    triggerRef.current?.focus();

    if (onChange && String(option.value) !== String(value)) {
      const syntheticEvent = {
        target: {
          id: selectId,
          name: name || selectId,
          value: option.value,
        },
        currentTarget: {
          id: selectId,
          name: name || selectId,
          value: option.value,
        },
      };
      onChange(syntheticEvent);
    }
  };

  // Keyboard Navigation Handler
  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen) {
          if (
            highlightedIndex >= 0 &&
            highlightedIndex < normalizedOptions.length
          ) {
            handleSelectOption(normalizedOptions[highlightedIndex]);
          }
        } else {
          setIsOpen(true);
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < normalizedOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : normalizedOptions.length - 1
          );
        }
        break;

      case "Escape":
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
        }
        break;

      case "Tab":
        if (isOpen) {
          setIsOpen(false);
        }
        break;

      default:
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col gap-1.5 ${containerClassName}`}
    >
      {/* Label */}
      {label && (
        <label
          htmlFor={selectId}
          onClick={() => triggerRef.current?.focus()}
          className="text-xs font-semibold text-slate-700 tracking-wide flex items-center justify-between select-none cursor-pointer"
        >
          <span>
            {label} {required && <span className="text-rose-500">*</span>}
          </span>
        </label>
      )}

      {/* Select Control Container */}
      <div className="relative w-full">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center z-10">
            {leftIcon}
          </div>
        )}

        {/* Custom Trigger Button */}
        <button
          ref={triggerRef}
          id={selectId}
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-labelledby={label ? selectId : undefined}
          aria-disabled={disabled}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${selectId}-error`
              : helperText
              ? `${selectId}-helper`
              : undefined
          }
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          className={`w-full text-xs sm:text-sm bg-white rounded-xl border transition-all duration-150 py-2.5 px-3.5 text-left flex items-center justify-between cursor-pointer select-none ${
            leftIcon ? "pl-10" : ""
          } ${
            error
              ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              : isOpen
              ? "border-slate-900 ring-2 ring-slate-100 shadow-xs"
              : "border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
          } ${
            disabled
              ? "bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200"
              : "text-slate-900"
          } ${className}`}
          {...props}
        >
          <span className="truncate pr-2">
            {selectedOption ? (
              selectedOption.label
            ) : (
              <span className="text-slate-400 font-normal">
                {placeholder}
              </span>
            )}
          </span>

          <ChevronDown
            className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-slate-700" : ""
            }`}
          />
        </button>

        {/* Custom Dropdown Menu */}
        {isOpen && (
          <div
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            aria-label={label || placeholder}
            className={`absolute left-0 right-0 top-full mt-1.5 z-50 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 space-y-0.5 animate-in fade-in-50 zoom-in-95 duration-100 scrollbar-none ${menuClassName}`}
          >
            {normalizedOptions.length > 0 ? (
              normalizedOptions.map((option, idx) => {
                const isSelected =
                  selectedOption &&
                  String(selectedOption.value) === String(option.value);
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={`${selectId}-opt-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled}
                    onClick={() => handleSelectOption(option)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`px-3.5 py-2.5 mx-1 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between cursor-pointer transition-colors ${
                      option.disabled
                        ? "text-slate-300 cursor-not-allowed bg-transparent"
                        : isSelected
                        ? "bg-slate-900 text-white font-semibold"
                        : isHighlighted
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate pr-2">{option.label}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-white" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-3 text-xs text-slate-400 text-center">
                No options available
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error / Helper Text */}
      {error ? (
        <p
          id={`${selectId}-error`}
          role="alert"
          className="text-xs text-rose-500 font-medium tracking-tight mt-0.5"
        >
          {error}
        </p>
      ) : helperText ? (
        <p id={`${selectId}-helper`} className="text-xs text-slate-500 mt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

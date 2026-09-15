"use client";

import React, { useState, useRef, useEffect, useId, useMemo, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Clock,
} from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const SHORT_MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const WEEKDAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/**
 * Timezone-safe date helpers that operate strictly on calendar day strings (YYYY-MM-DD)
 * to avoid UTC timezone offset shifts in local browsers.
 */
function parseDateString(dateVal) {
  if (!dateVal) return null;

  if (dateVal instanceof Date) {
    if (isNaN(dateVal.getTime())) return null;
    return new Date(dateVal.getFullYear(), dateVal.getMonth(), dateVal.getDate());
  }

  if (typeof dateVal === "string") {
    const trimmed = dateVal.trim();
    // Match YYYY-MM-DD
    const match = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(trimmed);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }

    // Fallback for standard date parsing
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
  }

  return null;
}

function formatDateToString(dateObj) {
  if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return "";
  }
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateVal) {
  const d = parseDateString(dateVal);
  if (!d) return "";
  const monthStr = SHORT_MONTH_NAMES[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  return `${monthStr} ${day}, ${year}`;
}

function isSameDay(d1, d2) {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isDateBefore(d1, d2) {
  if (!d1 || !d2) return false;
  const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
  const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
  return t1 < t2;
}

function isDateAfter(d1, d2) {
  if (!d1 || !d2) return false;
  const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
  const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
  return t1 > t2;
}

export default function DatePicker({
  label,
  id,
  name,
  value,
  onChange,
  minDate,
  maxDate,
  min, // Alias for minDate
  max, // Alias for maxDate
  placeholder = "Select date",
  required = false,
  disabled = false,
  error,
  helperText,
  leftIcon = null,
  clearable = true,
  className = "",
  containerClassName = "",
  popoverAlign = "auto", // "auto" | "left" | "right"
  ...props
}) {
  const generatedId = useId();
  const pickerId = id || name || `datepicker-${generatedId}`;
  const popoverId = `popover-${pickerId}`;

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);

  // Normalize current selected date and limits
  const selectedDate = useMemo(() => parseDateString(value), [value]);
  const effectiveMinDate = useMemo(() => parseDateString(minDate || min), [minDate, min]);
  const effectiveMaxDate = useMemo(() => parseDateString(maxDate || max), [maxDate, max]);

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  // Currently viewed month/year in the calendar
  const [viewYear, setViewYear] = useState(() => (selectedDate ? selectedDate.getFullYear() : today.getFullYear()));
  const [viewMonth, setViewMonth] = useState(() => (selectedDate ? selectedDate.getMonth() : today.getMonth()));

  // Focused day for keyboard navigation
  const [focusedDate, setFocusedDate] = useState(() => (selectedDate || today));

  // Sync viewed month when selected date changes externally while closed
  useEffect(() => {
    if (selectedDate && !isOpen) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
      setFocusedDate(selectedDate);
    }
  }, [selectedDate, isOpen]);

  // Adjust popover alignment relative to window viewport
  const updateAlignment = useCallback(() => {
    if (popoverAlign === "right") {
      setAlignRight(true);
      return;
    }
    if (popoverAlign === "left") {
      setAlignRight(false);
      return;
    }
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      // If trigger is close to right viewport edge, align popover to right
      if (rect.left + 320 > screenWidth && rect.right - 320 >= 0) {
        setAlignRight(true);
      } else {
        setAlignRight(false);
      }
    }
  }, [popoverAlign]);

  // Handle open / close
  const openPopover = () => {
    if (disabled) return;
    updateAlignment();
    const initialView = selectedDate || today;
    setViewYear(initialView.getFullYear());
    setViewMonth(initialView.getMonth());
    setFocusedDate(initialView);
    setIsOpen(true);
  };

  const closePopover = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        closePopover();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      window.addEventListener("resize", updateAlignment);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      window.removeEventListener("resize", updateAlignment);
    };
  }, [isOpen, closePopover, updateAlignment]);

  // Emit change event compatible with standard form handlers
  const handleSelectDate = (dateObj) => {
    if (disabled) return;
    const dateString = formatDateToString(dateObj);

    if (onChange) {
      // Create synthetic event for compatibility with form libraries and (e) => setForm(...)
      const syntheticEvent = {
        target: {
          id: pickerId,
          name: name || pickerId,
          value: dateString,
        },
        currentTarget: {
          id: pickerId,
          name: name || pickerId,
          value: dateString,
        },
        persist: () => {},
      };
      onChange(syntheticEvent);
    }

    closePopover();
    if (triggerRef.current) {
      triggerRef.current.focus();
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (disabled) return;

    if (onChange) {
      const syntheticEvent = {
        target: {
          id: pickerId,
          name: name || pickerId,
          value: "",
        },
        currentTarget: {
          id: pickerId,
          name: name || pickerId,
          value: "",
        },
        persist: () => {},
      };
      onChange(syntheticEvent);
    }
  };

  // Month navigation
  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Check if a date is disabled according to minDate/maxDate
  const isDateDisabled = useCallback(
    (d) => {
      if (effectiveMinDate && isDateBefore(d, effectiveMinDate)) return true;
      if (effectiveMaxDate && isDateAfter(d, effectiveMaxDate)) return true;
      return false;
    },
    [effectiveMinDate, effectiveMaxDate]
  );

  // Generate calendar grid for current view
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days = [];

    // Previous month filler days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(viewYear, viewMonth - 1, daysInPrevMonth - i);
      days.push({
        date: d,
        isCurrentMonth: false,
        disabled: isDateDisabled(d),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(viewYear, viewMonth, i);
      days.push({
        date: d,
        isCurrentMonth: true,
        disabled: isDateDisabled(d),
      });
    }

    // Next month filler days (fill up to 35 or 42 grid slots)
    const totalFilled = days.length;
    const targetSlots = totalFilled > 35 ? 42 : 35;
    const remaining = targetSlots - totalFilled;

    for (let i = 1; i <= remaining; i++) {
      const d = new Date(viewYear, viewMonth + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        disabled: isDateDisabled(d),
      });
    }

    return days;
  }, [viewYear, viewMonth, isDateDisabled]);

  // Keyboard navigation inside the open calendar
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        openPopover();
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      closePopover();
      if (triggerRef.current) triggerRef.current.focus();
      return;
    }

    let nextFocus = new Date(focusedDate);

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      nextFocus.setDate(nextFocus.getDate() - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextFocus.setDate(nextFocus.getDate() + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      nextFocus.setDate(nextFocus.getDate() - 7);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      nextFocus.setDate(nextFocus.getDate() + 7);
    } else if (e.key === "PageUp") {
      e.preventDefault();
      nextFocus.setMonth(nextFocus.getMonth() - 1);
    } else if (e.key === "PageDown") {
      e.preventDefault();
      nextFocus.setMonth(nextFocus.getMonth() + 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      nextFocus = new Date(viewYear, viewMonth, 1);
    } else if (e.key === "End") {
      e.preventDefault();
      nextFocus = new Date(viewYear, viewMonth + 1, 0);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!isDateDisabled(focusedDate)) {
        handleSelectDate(focusedDate);
      }
      return;
    } else {
      return;
    }

    setFocusedDate(nextFocus);
    setViewYear(nextFocus.getFullYear());
    setViewMonth(nextFocus.getMonth());
  };

  const displayString = formatDisplayDate(value);

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col gap-1.5 relative ${containerClassName}`}
    >
      {/* Label */}
      {label && (
        <label
          htmlFor={pickerId}
          className="text-xs font-semibold text-slate-700 tracking-wide flex items-center justify-between select-none"
        >
          <span>
            {label} {required && <span className="text-rose-500">*</span>}
          </span>
        </label>
      )}

      {/* Trigger Button */}
      <div className="relative flex items-center">
        <button
          ref={triggerRef}
          id={pickerId}
          type="button"
          disabled={disabled}
          onClick={openPopover}
          onKeyDown={handleKeyDown}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={isOpen ? popoverId : undefined}
          aria-label={label ? `${label}, selected date: ${displayString || "none"}` : `Select date, currently: ${displayString || "none"}`}
          className={`w-full text-sm bg-white rounded-xl border transition-all duration-150 py-2.5 px-3.5 text-left flex items-center justify-between select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
            leftIcon || true ? "pl-10" : ""
          } ${clearable && value && !disabled ? "pr-16" : "pr-10"} ${
            error
              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
              : isOpen
              ? "border-slate-900 ring-2 ring-slate-100"
              : "border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-slate-100"
          } ${className}`}
          {...props}
        >
          {/* Formatted Date Value or Placeholder */}
          <span className={displayString ? "text-slate-900 font-medium truncate" : "text-slate-400 truncate"}>
            {displayString || placeholder}
          </span>
        </button>

        {/* Left Calendar Icon */}
        <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
          {leftIcon || <CalendarIcon className="h-4 w-4" />}
        </div>

        {/* Right Icons: Clear & Chevron */}
        <div className="absolute right-3 flex items-center gap-1">
          {clearable && value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Clear date selection"
              tabIndex={-1}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          <div className={`text-slate-400 pointer-events-none transition-transform duration-200 ${isOpen ? "rotate-180 text-slate-700" : ""}`}>
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Helper / Error Text */}
      {error ? (
        <p className="text-xs text-rose-500 font-medium tracking-tight mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>
      ) : null}

      {/* Calendar Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          id={popoverId}
          role="dialog"
          aria-modal="true"
          aria-label={`Calendar for ${MONTH_NAMES[viewMonth]} ${viewYear}`}
          className={`absolute top-full z-50 mt-1.5 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 animate-in zoom-in-95 duration-150 ${
            alignRight ? "right-0" : "left-0"
          }`}
          onKeyDown={handleKeyDown}
        >
          {/* Calendar Header: Month/Year navigation */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-slate-900">
              <span>{MONTH_NAMES[viewMonth]}</span>
              <span className="text-[#8c6838] font-extrabold">{viewYear}</span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekdays Row */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAY_NAMES.map((dayName, idx) => (
              <span
                key={dayName}
                className={`text-[11px] font-bold uppercase tracking-wider py-1 ${
                  idx === 0 || idx === 6 ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {dayName}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1" role="grid">
            {calendarDays.map((item, idx) => {
              const isSelected = selectedDate && isSameDay(item.date, selectedDate);
              const isCurrentToday = isSameDay(item.date, today);
              const isFocused = isSameDay(item.date, focusedDate);

              return (
                <button
                  key={`${item.date.toISOString()}-${idx}`}
                  type="button"
                  disabled={item.disabled}
                  onClick={() => handleSelectDate(item.date)}
                  className={`h-9 w-full rounded-xl text-xs font-semibold flex items-center justify-center transition-all duration-150 select-none cursor-pointer relative ${
                    item.disabled
                      ? "text-slate-300 opacity-40 cursor-not-allowed hover:bg-transparent"
                      : isSelected
                      ? "bg-slate-900 text-white font-bold shadow-xs hover:bg-slate-800 ring-2 ring-slate-900/20"
                      : isCurrentToday
                      ? "text-[#8c6838] font-bold bg-[#fbf7f2] border border-[#b48c58]/50 hover:bg-[#f3e9db]"
                      : item.isCurrentMonth
                      ? "text-slate-800 hover:bg-slate-100 hover:text-slate-900"
                      : "text-slate-400 hover:bg-slate-50"
                  } ${isFocused && !isSelected ? "ring-1 ring-slate-400" : ""}`}
                  aria-label={`${item.date.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}${isSelected ? ", selected" : ""}${item.disabled ? ", disabled" : ""}`}
                  aria-selected={isSelected}
                >
                  <span>{item.date.getDate()}</span>

                  {/* Tiny dot indicator for today when selected */}
                  {isCurrentToday && isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 bg-[#b48c58] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Action Footer */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              disabled={isDateDisabled(today)}
              onClick={() => handleSelectDate(today)}
              className="text-[#8c6838] hover:text-[#72522a] font-semibold py-1 px-2 rounded-lg hover:bg-[#fbf7f2] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Today
            </button>

            {clearable && value && (
              <button
                type="button"
                onClick={(e) => {
                  handleClear(e);
                  closePopover();
                }}
                className="text-slate-400 hover:text-slate-700 py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

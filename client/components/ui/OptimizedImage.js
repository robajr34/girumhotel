"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { BedDouble, ImageOff } from "lucide-react";

/**
 * Reusable OptimizedImage Component
 * Wraps Next.js Image component with:
 * - Automatic loading skeleton / pulse state
 * - Graceful fallback UI on missing or broken external image URLs
 * - Responsive sizing and layout stability (no shifts)
 * - Accessible alt text propagation
 */
export default function OptimizedImage({
  src,
  alt = "Hotel accommodation view",
  fill = false,
  width,
  height,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  className = "",
  containerClassName = "",
  objectFit = "cover",
  fallbackText = "Image unavailable",
  fallbackIcon,
  onLoad,
  onError,
  ...props
}) {
  const [isError, setIsError] = useState(!src);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset state whenever src changes
    setIsError(!src);
    setIsLoading(true);
  }, [src]);

  const handleImageError = (e) => {
    setIsError(true);
    setIsLoading(false);
    if (onError) onError(e);
  };

  const handleImageLoad = (e) => {
    setIsLoading(false);
    if (onLoad) onLoad(e);
  };

  // Safe alt text verification
  const safeAlt = alt && alt.trim() ? alt : "Hotel accommodation view";

  // If source is missing or image failed to load
  if (isError || !src) {
    return (
      <div
        className={`w-full h-full min-h-[120px] bg-slate-100 border border-slate-200/60 rounded-xl flex flex-col items-center justify-center text-slate-400 p-4 text-center select-none ${containerClassName}`}
        aria-label={safeAlt}
      >
        <div className="w-10 h-10 rounded-full bg-slate-200/80 flex items-center justify-center mb-2 text-slate-400">
          {fallbackIcon || <BedDouble className="h-5 w-5" />}
        </div>
        <span className="text-[11px] font-medium text-slate-500">
          {fallbackText}
        </span>
      </div>
    );
  }

  // Object fit class mapping
  const fitClass =
    objectFit === "contain"
      ? "object-contain"
      : objectFit === "fill"
      ? "object-fill"
      : "object-cover";

  return (
    <div className={`relative overflow-hidden ${fill ? "w-full h-full" : ""} ${containerClassName}`}>
      {/* Subtle background placeholder while loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-200/80 animate-pulse z-10" />
      )}

      <Image
        src={src}
        alt={safeAlt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={fill ? sizes : undefined}
        priority={priority}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`transition-opacity duration-300 ${fitClass} ${
          isLoading ? "opacity-0" : "opacity-100"
        } ${className}`}
        {...props}
      />
    </div>
  );
}

"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { HOTEL } from "@/constants/hotel";
import {
  Images,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  BedDouble,
  ArrowRight,
  Eye,
} from "lucide-react";

/**
 * Safely parse and normalize raw HOTEL.images into standardized gallery image objects.
 * Handles strings, objects, and gracefully filters out null, undefined, and empty values.
 */
function normalizeGalleryImages(rawImages) {
  if (!rawImages || !Array.isArray(rawImages)) {
    return [];
  }

  const validImages = [];

  rawImages.forEach((item, index) => {
    if (!item) return;

    // Case 1: Plain string path/URL
    if (typeof item === "string") {
      const trimmed = item.trim();
      if (trimmed.length > 0) {
        validImages.push({
          id: `img-${index}`,
          url: trimmed,
          title: `${HOTEL.name || "Girum Hotel"} View ${index + 1}`,
          caption: `${HOTEL.websiteName || "Girum Hotel"} accommodation and spaces.`,
          category: "General",
        });
      }
      return;
    }

    // Case 2: Object containing image attributes
    if (typeof item === "object") {
      const url =
        (typeof item.url === "string" && item.url.trim()) ||
        (typeof item.src === "string" && item.src.trim()) ||
        (typeof item.image === "string" && item.image.trim()) ||
        (typeof item.path === "string" && item.path.trim()) ||
        "";

      if (url.length > 0) {
        validImages.push({
          id: item.id || `img-${index}`,
          url,
          title: item.title || `${HOTEL.name || "Girum Hotel"} View ${index + 1}`,
          caption: item.caption || item.description || `${HOTEL.websiteName || "Girum Hotel"} experience.`,
          category: item.category || "General",
        });
      }
    }
  });

  return validImages;
}

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [lightboxLoading, setLightboxLoading] = useState(true);

  // Normalize images from the HOTEL constant
  const allImages = useMemo(() => {
    return normalizeGalleryImages(HOTEL.images);
  }, []);

  // Extract unique categories
  const categories = useMemo(() => {
    if (allImages.length === 0) return [];

    const catSet = new Set();
    allImages.forEach((img) => {
      if (img.category) catSet.add(img.category);
    });

    const list = Array.from(catSet);
    return ["all", ...list];
  }, [allImages]);

  // Filter images according to active category
  const filteredImages = useMemo(() => {
    if (selectedCategory === "all") return allImages;
    return allImages.filter((img) => img.category === selectedCategory);
  }, [allImages, selectedCategory]);

  // Lightbox handlers
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxLoading(true);
  };

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const showPrevImage = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxLoading(true);
    setLightboxIndex((prev) =>
      prev === 0 ? filteredImages.length - 1 : prev - 1
    );
  }, [lightboxIndex, filteredImages.length]);

  const showNextImage = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxLoading(true);
    setLightboxIndex((prev) =>
      prev === filteredImages.length - 1 ? 0 : prev + 1
    );
  }, [lightboxIndex, filteredImages.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        showPrevImage();
      } else if (e.key === "ArrowRight") {
        showNextImage();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex, closeLightbox, showPrevImage, showNextImage]);

  const activeLightboxImage =
    lightboxIndex !== null ? filteredImages[lightboxIndex] : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafc]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200/80">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fbf7f2] border border-[#e8d8c3] text-[#8c6838] text-xs font-semibold mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Visual Showcase</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Hotel Gallery
            </h1>

            <p className="text-sm sm:text-base text-slate-500 mt-2 leading-relaxed">
              Explore {HOTEL.websiteName || HOTEL.name} and discover our rooms, spaces, dining atmospheres, and guest amenities in {HOTEL.city}, {HOTEL.country}.
            </p>
          </div>

          {allImages.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl shadow-xs">
                {allImages.length} {allImages.length === 1 ? "Photograph" : "Photographs"}
              </span>

              <Link href="/rooms">
                <Button variant="gold" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                  Book a Room
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Gallery Content */}
        {allImages.length === 0 ? (
          /* Empty State */
          <div className="py-16 sm:py-24">
            <div className="max-w-md mx-auto text-center p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/80 shadow-card">
              <div className="w-16 h-16 rounded-2xl bg-[#fbf7f2] border border-[#e8d8c3] flex items-center justify-center text-[#8c6838] mx-auto mb-5 shadow-xs">
                <Images className="h-8 w-8" />
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                No Images Available
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                Hotel gallery images haven&apos;t been added yet. Please check back soon or explore our available rooms and suites.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/rooms" className="w-full sm:w-auto">
                  <Button variant="primary" size="sm" className="w-full">
                    <BedDouble className="h-4 w-4 mr-1.5" />
                    Browse Rooms
                  </Button>
                </Link>

                <Link href="/" className="w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="w-full">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {/* Category Filter Tabs (if multiple categories exist) */}
            {categories.length > 2 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((category) => {
                  const isActive = selectedCategory === category;
                  const label =
                    category === "all"
                      ? "All Photos"
                      : category;

                  const count =
                    category === "all"
                      ? allImages.length
                      : allImages.filter((img) => img.category === category).length;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer inline-flex items-center gap-2 ${
                        isActive
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                      }`}
                    >
                      <span>{label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                          isActive
                            ? "bg-slate-800 text-slate-200"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredImages.map((image, index) => (
                <div
                  key={image.id || index}
                  onClick={() => openLightbox(index)}
                  className="group relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover overflow-hidden transition-all duration-300 cursor-pointer flex flex-col"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openLightbox(index);
                    }
                  }}
                  aria-label={`View full image: ${image.title}`}
                >
                  {/* Image Container with Fixed Aspect Ratio (prevents layout shifts) */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <Image
                      src={image.url}
                      alt={image.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading={index < 6 ? "eager" : "lazy"}
                      priority={index < 3}
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />

                    {/* Gradient Overlay for Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5" />

                    {/* Category Badge */}
                    {image.category && image.category !== "General" && (
                      <div className="absolute top-3.5 left-3.5 z-10">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/90 text-slate-900 backdrop-blur-xs shadow-xs border border-white/40">
                          {image.category}
                        </span>
                      </div>
                    )}

                    {/* Expand icon on hover */}
                    <div className="absolute top-3.5 right-3.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-8 h-8 rounded-full bg-slate-900/70 text-white backdrop-blur-xs flex items-center justify-center hover:bg-slate-900 transition-colors">
                        <Maximize2 className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Hover text preview */}
                    <div className="absolute bottom-0 inset-x-0 p-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
                      <p className="text-sm font-bold line-clamp-1">{image.title}</p>
                      <p className="text-[11px] text-slate-200/90 line-clamp-1 mt-0.5">{image.caption}</p>
                    </div>
                  </div>

                  {/* Caption Bar beneath image */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-white border-t border-slate-100">
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {image.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {image.caption}
                      </p>
                    </div>

                    <div className="shrink-0 text-slate-400 group-hover:text-[#8c6838] transition-colors">
                      <Eye className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Lightbox / Fullscreen Image Preview Modal */}
      {activeLightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 sm:p-6 select-none animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Image Lightbox Preview"
          onClick={closeLightbox}
        >
          {/* Top Bar: Counter & Close Button */}
          <div
            className="absolute top-4 inset-x-4 sm:top-6 sm:inset-x-8 flex items-center justify-between z-30 pointer-events-none"
          >
            <div className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-white text-xs font-semibold backdrop-blur-xs">
              {lightboxIndex + 1} / {filteredImages.length}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
              className="pointer-events-auto p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-800 transition-colors cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Arrows */}
          {filteredImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showPrevImage();
                }}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-800 transition-all cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showNextImage();
                }}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-800 transition-all cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Center Image Container */}
          <div
            className="relative w-full max-w-5xl h-[65vh] sm:h-[75vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {lightboxLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-10 h-10 border-2 border-[#b48c58] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            <Image
              src={activeLightboxImage.url}
              alt={activeLightboxImage.title}
              fill
              sizes="(max-width: 1280px) 100vw, 1200px"
              priority
              className={`object-contain transition-opacity duration-300 ${
                lightboxLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setLightboxLoading(false)}
            />
          </div>

          {/* Bottom Info Bar */}
          <div
            className="absolute bottom-4 inset-x-4 sm:bottom-6 sm:inset-x-8 z-30 pointer-events-none flex justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pointer-events-auto max-w-xl w-full bg-slate-900/90 border border-slate-800 text-white px-5 py-3 rounded-2xl backdrop-blur-md text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                {activeLightboxImage.category && activeLightboxImage.category !== "General" && (
                  <Badge variant="gold" size="sm">
                    {activeLightboxImage.category}
                  </Badge>
                )}
                <h4 className="text-sm font-bold tracking-tight">
                  {activeLightboxImage.title}
                </h4>
              </div>
              <p className="text-xs text-slate-300 line-clamp-2">
                {activeLightboxImage.caption}
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

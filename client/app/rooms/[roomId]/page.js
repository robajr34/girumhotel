"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { HOTEL } from "@/constants/hotel";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import OptimizedImage from "@/components/ui/OptimizedImage";
import CreateBookingModal from "@/components/bookings/CreateBookingModal";
import roomApi from "@/services/roomApi";
import { getErrorMessage } from "@/services/api";
import { toast } from "sonner";
import {
  BedDouble,
  Users,
  Sparkles,
  ArrowLeft,
  CalendarCheck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Info,
  Check
} from "lucide-react";

export default function RoomDetailPage({ params }) {
  const unwrappedParams = use(params);
  const roomId = unwrappedParams.roomId;

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const res = await roomApi.getRoomById(roomId);
        const roomData = res.data?.data;
        setRoom(roomData);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoom();
    }
  }, [roomId]);

  // Handle safe images array
  const images = Array.isArray(room?.images) ? room.images.filter(Boolean) : [];
  const activeImage = images[selectedImageIdx] || images[0] || null;

  const handleNextImage = () => {
    if (images.length > 1) {
      setSelectedImageIdx((prev) => (prev + 1) % images.length);
    }
  };

  const handlePrevImage = () => {
    if (images.length > 1) {
      setSelectedImageIdx((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafc]">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/rooms"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Rooms Catalog</span>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-4">
                <Skeleton className="h-80 sm:h-[420px] w-full rounded-3xl" />
                <div className="flex gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-20 w-24 rounded-xl" />
                  ))}
                </div>
              </div>
              <div className="lg:col-span-5 space-y-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          </div>
        ) : room ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Image Gallery */}
            <div className="lg:col-span-7 space-y-4">
              {/* Main Image Display */}
              <div className="relative h-80 sm:h-[420px] w-full rounded-3xl overflow-hidden bg-slate-900 shadow-soft group">
                <OptimizedImage
                  src={activeImage}
                  alt={`Room ${room.roomNumber} - ${room.type} Suite view ${selectedImageIdx + 1}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />

                {/* Status Badge overlay */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 text-slate-900 backdrop-blur-sm">
                    Floor {room.floor}
                  </span>
                  <Badge status={room.status} size="md" />
                </div>

                {/* Gallery Navigation Arrows (if multiple images exist) */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      aria-label="Previous room image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      aria-label="Next room image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Image Counter Indicator */}
                    <div className="absolute bottom-4 right-4 z-20 px-3 py-1 rounded-full bg-slate-950/70 text-white text-xs font-medium backdrop-blur-xs">
                      {selectedImageIdx + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Gallery Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {images.map((imgUrl, idx) => {
                    const isSelected = idx === selectedImageIdx;
                    return (
                      <button
                        key={`${room._id}-thumb-${idx}`}
                        type="button"
                        onClick={() => setSelectedImageIdx(idx)}
                        className={`relative h-20 w-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#b48c58] ring-2 ring-[#b48c58]/30 scale-105"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                        aria-label={`View photo ${idx + 1} of Room ${room.roomNumber}`}
                        aria-selected={isSelected}
                      >
                        <OptimizedImage
                          src={imgUrl}
                          alt={`Thumbnail ${idx + 1} for Room ${room.roomNumber}`}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Room Details & Booking Action */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-card space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#8c6838]">
                    {room.type} Suite • Floor {room.floor}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                    Room {room.roomNumber}
                  </h1>
                </div>

                {/* Nightly Rate & Capacity */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Rate Per Night
                    </span>
                    <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
                      {typeof room.pricePerNight === "number"
                        ? room.pricePerNight.toLocaleString()
                        : "—"}{" "}
                      <span className="text-xs font-normal text-slate-500">
                        ETB
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Max Guests
                    </span>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800 mt-0.5 justify-end">
                      <Users className="h-4 w-4 text-slate-500" />
                      <span>{room.capacity} Guests</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Suite Description
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {room.description ||
                      `Experience refined comfort in our spacious ${room.type} suite. Featuring high-speed Internet, luxury bedding, and round-the-clock room service.`}
                  </p>
                </div>

                {/* Amenities */}
                {room.amenities?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Included Amenities
                    </h3>
                    <div className="grid grid-cols-2 gap-2.5">
                      {room.amenities.map((amenity, idx) => (
                        <div
                          key={`detail-amenity-${idx}`}
                          className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100/80 text-xs font-semibold text-slate-700"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-[#b48c58] shrink-0" />
                          <span className="truncate">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reserve Action Button */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <Button
                    size="lg"
                    variant={room.status === "available" ? "gold" : "secondary"}
                    disabled={room.status !== "available"}
                    className="w-full text-sm font-bold py-3.5"
                    onClick={() => setBookingModalOpen(true)}
                  >
                    {room.status === "available"
                      ? "Reserve Room Now"
                      : `Currently ${room.status}`}
                  </Button>

                  <p className="text-[11px] text-slate-400 text-center">
                    Instant reservation verification &bull; Free cancellation rules apply
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 max-w-lg mx-auto">
            <BedDouble className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h2 className="text-base font-bold text-slate-900">
              Room Record Not Found
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              The requested room could not be found in our inventory or may have been removed.
            </p>
            <Link href="/rooms">
              <Button variant="outline" size="sm">
                Browse Available Rooms
              </Button>
            </Link>
          </div>
        )}
      </main>

      <Footer />

      {/* Booking Modal */}
      {room && (
        <CreateBookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          preselectedRoom={room}
        />
      )}
    </div>
  );
}

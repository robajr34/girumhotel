"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import BankDetailsModal from "@/components/BankDetailsModal";
import { Skeleton } from "@/components/ui/Skeleton";
import bookingApi from "@/services/bookingApi";
import { getErrorMessage } from "@/services/api";
import { toast } from "sonner";
import {
  CalendarDays,
  User,
  Phone,
  Globe,
  BedDouble,
  DollarSign,
  Clock,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Landmark
} from "lucide-react";

export default function BookingDetailPage({ params }) {
  const unwrappedParams = use(params);
  const bookingId = unwrappedParams.bookingId;

  const { role, user } = useAuth();
  const router = useRouter();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'cancel' | 'delete'
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.getBooking(bookingId);
      setBooking(res.data?.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const handleStatusAction = async (action) => {
    try {
      setActionLoading(true);
      if (action === "confirm") {
        await bookingApi.confirmBooking(bookingId);
        toast.success("Booking confirmed.");
      } else if (action === "check-in") {
        await bookingApi.checkInBooking(bookingId);
        toast.success("Guest checked in.");
      } else if (action === "check-out") {
        await bookingApi.checkOutBooking(bookingId);
        toast.success("Guest checked out.");
      }
      fetchBooking();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    try {
      setConfirmLoading(true);
      if (confirmAction === "cancel") {
        await bookingApi.cancelBooking(bookingId);
        toast.success("Booking cancelled.");
        fetchBooking();
      } else if (confirmAction === "delete") {
        await bookingApi.deleteBooking(bookingId);
        toast.success("Booking deleted.");
        router.push("/bookings");
      }
      setConfirmOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setConfirmLoading(false);
    }
  };

  const isStaff = role === "owner" || role === "manager" || role === "receptionist";

  // Calculate nights
  const calculateNights = () => {
    if (!booking?.checkInDate || !booking?.checkOutDate) return 1;
    const diff = new Date(booking.checkOutDate) - new Date(booking.checkInDate);
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 1);
  };

  const nights = calculateNights();

  const steps = ["pending", "confirmed", "checked_in", "checked_out"];
  const currentStepIdx = booking ? steps.indexOf(booking.status) : 0;

  return (
    <ProtectedRoute>
      <AppShell
        title={`Reservation #${booking?.bookingNumber || "Details"}`}
        subtitle="Detailed booking lifecycle records and guest reservation data"
      >
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Back button */}
          <div>
            <Link
              href="/bookings"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to all bookings</span>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-28 bg-white rounded-2xl border border-slate-200 p-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64 bg-white rounded-2xl border border-slate-200 p-6" />
                <div className="h-64 bg-white rounded-2xl border border-slate-200 p-6" />
              </div>
            </div>
          ) : booking ? (
            <>
              {/* Header Status Card */}
              <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#b48c58]">
                      Official Reservation Record
                    </span>
                    <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
                      {booking.bookingNumber}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Booked on {new Date(booking.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge status={booking.status} size="lg" />
                  </div>
                </div>

                {/* Stepper Progress Bar (if not cancelled) */}
                {booking.status !== "cancelled" ? (
                  <div className="mt-8 pt-6 border-t border-slate-700/60">
                    <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
                      {steps.map((st, idx) => {
                        const isPastOrCurrent = idx <= currentStepIdx;
                        return (
                          <div key={st} className="space-y-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                isPastOrCurrent ? "bg-[#b48c58]" : "bg-slate-700"
                              }`}
                            />
                            <span
                              className={`text-[11px] capitalize ${
                                isPastOrCurrent ? "text-[#b48c58]" : "text-slate-500"
                              }`}
                            >
                              {st.replace(/_/g, " ")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center gap-2 text-rose-400 text-xs font-medium">
                    <AlertCircle className="h-4 w-4" />
                    <span>This reservation was cancelled on {booking.cancelledAt ? new Date(booking.cancelledAt).toLocaleString() : "record"}.</span>
                  </div>
                )}
              </Card>

              {/* Detail Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Guest Information Card */}
                <Card>
                  <CardHeader>
                    <CardTitle subtitle="Primary guest identification">
                      Guest Information
                    </CardTitle>
                    <User className="h-4 w-4 text-slate-400" />
                  </CardHeader>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-500">Full Name</span>
                      <span className="font-bold text-slate-900">
                        {booking.guest?.firstName} {booking.guest?.lastName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-500">Phone Number</span>
                      <span className="font-bold text-slate-900">
                        {booking.guest?.phone}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-500">Nationality / Country</span>
                      <span className="font-semibold text-slate-800">
                        {booking.guest?.country || booking.guest?.nationality || "Ethiopia"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Guest Count</span>
                      <span className="font-semibold text-slate-800">
                        {booking.numberOfGuests} Guests
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Room Specs Card */}
                <Card>
                  <CardHeader>
                    <CardTitle subtitle="Assigned accommodation">
                      Room Details
                    </CardTitle>
                    <BedDouble className="h-4 w-4 text-slate-400" />
                  </CardHeader>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-500">Room Number</span>
                      <span className="font-bold text-slate-900 text-sm">
                        Room {booking.room?.roomNumber || "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-500">Suite Type</span>
                      <span className="font-semibold text-slate-800 capitalize">
                        {booking.room?.type} Suite
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-500">Floor Level</span>
                      <span className="font-semibold text-slate-800">
                        Floor {booking.room?.floor ?? "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Room Status</span>
                      <Badge status={booking.room?.status || "available"} size="sm" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Stay Timeline & Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle subtitle="Schedule breakdown and billing total">
                    Reservation Schedule & Billing
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-slate-400" />
                </CardHeader>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-6">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Check-In Schedule
                    </span>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {new Date(booking.checkInDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <span className="text-[11px] text-slate-400">After 2:00 PM</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Check-Out Schedule
                    </span>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {new Date(booking.checkOutDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <span className="text-[11px] text-slate-400">Before 11:00 AM</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Duration of Stay
                    </span>
                    <p className="text-sm font-bold text-[#8c6838] mt-1">
                      {nights} Night{nights !== 1 ? "s" : ""}
                    </p>
                    <span className="text-[11px] text-slate-400">
                      {booking.room?.pricePerNight?.toLocaleString()} {booking.currency} / night
                    </span>
                  </div>
                </div>

                {/* Special Requests */}
                {booking.specialRequests && (
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 mb-6 text-xs text-amber-900">
                    <strong className="block font-semibold mb-1">Guest Special Requests:</strong>
                    <span>{booking.specialRequests}</span>
                  </div>
                )}

                {/* Price Total */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <div>
                    <span className="text-sm font-bold text-slate-800">
                      Total Booking Amount
                    </span>
                    <button
                      type="button"
                      onClick={() => setBankModalOpen(true)}
                      className="text-xs text-[#8c6838] font-semibold hover:underline block cursor-pointer"
                    >
                      View Hotel Bank Details ↗
                    </button>
                  </div>
                  <p className="text-xl font-extrabold text-[#8c6838]">
                    {booking.totalPrice?.toLocaleString()} {booking.currency}
                  </p>
                </div>
              </Card>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-card">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Status Actions:</span>
                  <Badge status={booking.status} size="md" />
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {isStaff && booking.status === "pending" && (
                    <Button
                      variant="primary"
                      isLoading={actionLoading}
                      onClick={() => handleStatusAction("confirm")}
                    >
                      Confirm Booking
                    </Button>
                  )}

                  {isStaff && booking.status === "confirmed" && (
                    <Button
                      variant="gold"
                      isLoading={actionLoading}
                      onClick={() => handleStatusAction("check-in")}
                    >
                      Check In Guest
                    </Button>
                  )}

                  {isStaff && booking.status === "checked_in" && (
                    <Button
                      variant="secondary"
                      isLoading={actionLoading}
                      onClick={() => handleStatusAction("check-out")}
                    >
                      Check Out Guest
                    </Button>
                  )}

                  {!["checked_out", "cancelled"].includes(booking.status) && (
                    <Button
                      variant="outline"
                      className="text-rose-600 border-rose-200 hover:bg-rose-50"
                      onClick={() => {
                        setConfirmAction("cancel");
                        setConfirmOpen(true);
                      }}
                    >
                      Cancel Reservation
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    className="text-slate-400 hover:text-rose-600"
                    onClick={() => {
                      setConfirmAction("delete");
                      setConfirmOpen(true);
                    }}
                  >
                    Delete Record
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-xs text-slate-500">Booking record not found.</p>
            </Card>
          )}
        </div>

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirmAction}
          isLoading={confirmLoading}
          title={
            confirmAction === "cancel"
              ? `Cancel Booking #${booking?.bookingNumber}?`
              : `Delete Booking #${booking?.bookingNumber}?`
          }
          description={
            confirmAction === "cancel"
              ? "The reservation will be cancelled and room status updated."
              : "This action cannot be undone. The reservation record will be permanently deleted."
          }
          confirmText={confirmAction === "cancel" ? "Cancel Reservation" : "Delete Booking"}
        />

        <BankDetailsModal
          isOpen={bankModalOpen}
          onClose={() => setBankModalOpen(false)}
        />
      </AppShell>
    </ProtectedRoute>
  );
}

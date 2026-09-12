"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import CreateBookingModal from "@/components/bookings/CreateBookingModal";
import bookingApi from "@/services/bookingApi";
import { getErrorMessage } from "@/services/api";
import { toast } from "sonner";
import {
  CalendarDays,
  Plus,
  Search,
  Check,
  UserCheck,
  LogOut as CheckOutIcon,
  XCircle,
  Trash2,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Eye
} from "lucide-react";

export default function BookingsPage() {
  const { user, role } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchBookingNumber, setSearchBookingNumber] = useState("");
  const [page, setPage] = useState(1);

  // Action Loading & Confirmation
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetBooking, setTargetBooking] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // 'cancel' | 'delete'
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Create Booking Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      if (searchBookingNumber.trim()) {
        try {
          const res = await bookingApi.getBookingByNumber(searchBookingNumber.trim());
          const single = res.data?.data;
          if (single) {
            setBookings([single]);
            setMeta({ page: 1, totalPages: 1, total: 1 });
          } else {
            setBookings([]);
            setMeta({ page: 1, totalPages: 1, total: 0 });
          }
        } catch (searchErr) {
          setBookings([]);
          setMeta({ page: 1, totalPages: 1, total: 0 });
        }
        return;
      }

      const query = {
        page,
        limit: 15,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (statusFilter !== "all") {
        query.status = statusFilter;
      }

      if (role === "guest" && user?._id) {
        query.createdBy = user._id;
      }

      const res = await bookingApi.getAllBookings(query);
      const data = res.data?.data;
      setBookings(data?.bookings || []);
      setMeta(data?.meta || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
  };

  // Status Transitions
  const handleStatusTransition = async (bookingId, action) => {
    try {
      setActionLoadingId(bookingId);
      if (action === "confirm") {
        await bookingApi.confirmBooking(bookingId);
        toast.success("Booking confirmed successfully.");
      } else if (action === "check-in") {
        await bookingApi.checkInBooking(bookingId);
        toast.success("Guest checked in successfully.");
      } else if (action === "check-out") {
        await bookingApi.checkOutBooking(bookingId);
        toast.success("Guest checked out successfully.");
      }
      fetchBookings();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  // Confirm Actions (Cancel or Delete)
  const handleConfirmSubmit = async () => {
    if (!targetBooking || !confirmAction) return;

    try {
      setConfirmLoading(true);
      if (confirmAction === "cancel") {
        await bookingApi.cancelBooking(targetBooking._id);
        toast.success("Booking cancelled successfully.");
      } else if (confirmAction === "delete") {
        await bookingApi.deleteBooking(targetBooking._id);
        toast.success("Booking deleted successfully.");
      }
      setConfirmOpen(false);
      fetchBookings();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setConfirmLoading(false);
    }
  };

  const isStaff = role === "owner" || role === "manager" || role === "receptionist";

  return (
    <ProtectedRoute>
      <AppShell
        title={isStaff ? "Bookings & Reservations Manager" : "My Bookings"}
        subtitle={
          isStaff
            ? "Track reservations, manage guest check-ins, and process lifecycle states"
            : "View your reservation history, dates, and stay details"
        }
      >
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-card">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c6838]">
                Reservation Directory
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {isStaff ? "Hotel Bookings Directory" : "Your Reservations"}
              </h2>
            </div>

            <Button
              variant="gold"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setCreateModalOpen(true)}
            >
              New Reservation
            </Button>
          </div>

          {/* Status Tabs & Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {["all", "pending", "confirmed", "checked_in", "checked_out", "cancelled"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st.replace(/_/g, " ")}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="max-w-xs w-full">
              <Input
                placeholder="Search by Booking #..."
                value={searchBookingNumber}
                onChange={(e) => setSearchBookingNumber(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </form>
          </div>

          {/* Bookings Table Card */}
          <Card padding="none" className="overflow-hidden">
            {loading ? (
              <div className="p-6">
                <table className="w-full">
                  <tbody>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <TableRowSkeleton key={i} columns={7} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : bookings.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-3.5 px-5">Booking #</th>
                        <th className="py-3.5 px-5">Guest</th>
                        <th className="py-3.5 px-5">Room</th>
                        <th className="py-3.5 px-5">Stay Dates</th>
                        <th className="py-3.5 px-5">Guests</th>
                        <th className="py-3.5 px-5">Total</th>
                        <th className="py-3.5 px-5">Status</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {bookings.map((b) => (
                        <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-5 font-bold text-slate-900">
                            {b.bookingNumber}
                          </td>
                          <td className="py-4 px-5">
                            <p className="font-semibold text-slate-800">
                              {b.guest?.firstName} {b.guest?.lastName}
                            </p>
                            <p className="text-[11px] text-slate-400">{b.guest?.phone}</p>
                          </td>
                          <td className="py-4 px-5">
                            <span className="font-semibold text-slate-800">
                              Room {b.room?.roomNumber || "—"}
                            </span>
                            <span className="text-[11px] text-slate-400 block capitalize">
                              {b.room?.type} Suite
                            </span>
                          </td>
                          <td className="py-4 px-5 text-slate-600">
                            {new Date(b.checkInDate).toLocaleDateString()} →{" "}
                            {new Date(b.checkOutDate).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-5 text-slate-600">
                            {b.numberOfGuests}
                          </td>
                          <td className="py-4 px-5 font-bold text-slate-900">
                            {b.totalPrice?.toLocaleString()} {b.currency}
                          </td>
                          <td className="py-4 px-5">
                            <Badge status={b.status} size="sm" />
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isStaff && b.status === "pending" && (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  isLoading={actionLoadingId === b._id}
                                  onClick={() => handleStatusTransition(b._id, "confirm")}
                                >
                                  Confirm
                                </Button>
                              )}
                              {isStaff && b.status === "confirmed" && (
                                <Button
                                  size="sm"
                                  variant="gold"
                                  isLoading={actionLoadingId === b._id}
                                  onClick={() => handleStatusTransition(b._id, "check-in")}
                                >
                                  Check In
                                </Button>
                              )}
                              {isStaff && b.status === "checked_in" && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  isLoading={actionLoadingId === b._id}
                                  onClick={() => handleStatusTransition(b._id, "check-out")}
                                >
                                  Check Out
                                </Button>
                              )}

                              <Link href={`/bookings/${b._id}`}>
                                <Button size="sm" variant="outline" title="View booking details">
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </Link>

                              {!["checked_out", "cancelled"].includes(b.status) && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                                  onClick={() => {
                                    setTargetBooking(b);
                                    setConfirmAction("cancel");
                                    setConfirmOpen(true);
                                  }}
                                  title="Cancel booking"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Transformed Cards */}
                <div className="lg:hidden divide-y divide-slate-100 p-4">
                  {bookings.map((b) => (
                    <div key={b._id} className="py-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-base font-bold text-slate-900">
                            {b.bookingNumber}
                          </span>
                          <span className="text-xs text-slate-500 block">
                            Room {b.room?.roomNumber || "—"} ({b.room?.type})
                          </span>
                        </div>
                        <Badge status={b.status} size="sm" />
                      </div>

                      <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl space-y-1">
                        <p>
                          <strong className="text-slate-800">Guest:</strong> {b.guest?.firstName} {b.guest?.lastName} ({b.guest?.phone})
                        </p>
                        <p>
                          <strong className="text-slate-800">Dates:</strong> {new Date(b.checkInDate).toLocaleDateString()} - {new Date(b.checkOutDate).toLocaleDateString()}
                        </p>
                        <p>
                          <strong className="text-slate-800">Total:</strong> {b.totalPrice?.toLocaleString()} {b.currency} ({b.numberOfGuests} guests)
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {isStaff && b.status === "pending" && (
                          <Button
                            size="sm"
                            variant="primary"
                            isLoading={actionLoadingId === b._id}
                            onClick={() => handleStatusTransition(b._id, "confirm")}
                          >
                            Confirm
                          </Button>
                        )}
                        {isStaff && b.status === "confirmed" && (
                          <Button
                            size="sm"
                            variant="gold"
                            isLoading={actionLoadingId === b._id}
                            onClick={() => handleStatusTransition(b._id, "check-in")}
                          >
                            Check In
                          </Button>
                        )}
                        {isStaff && b.status === "checked_in" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            isLoading={actionLoadingId === b._id}
                            onClick={() => handleStatusTransition(b._id, "check-out")}
                          >
                            Check Out
                          </Button>
                        )}

                        <Link href={`/bookings/${b._id}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full">
                            Details
                          </Button>
                        </Link>

                        {!["checked_out", "cancelled"].includes(b.status) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-rose-600"
                            onClick={() => {
                              setTargetBooking(b);
                              setConfirmAction("cancel");
                              setConfirmOpen(true);
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-8">
                <EmptyState
                  icon={<CalendarDays className="h-6 w-6" />}
                  title="No reservations found"
                  description="There are no bookings matching the selected status or booking number."
                  actionLabel="Create Reservation"
                  onAction={() => setCreateModalOpen(true)}
                />
              </div>
            )}
          </Card>

          {/* Pagination */}
          {meta.totalPages > 1 && !searchBookingNumber && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-slate-500">
                Page {meta.page} of {meta.totalPages} ({meta.total} bookings total)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!meta.hasPreviousPage}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!meta.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Create Booking Modal */}
        <CreateBookingModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onBookingSuccess={() => fetchBookings()}
        />

        {/* Cancel / Delete Confirmation */}
        <ConfirmDialog
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirmSubmit}
          isLoading={confirmLoading}
          title={
            confirmAction === "cancel"
              ? `Cancel Booking ${targetBooking?.bookingNumber}?`
              : `Delete Booking ${targetBooking?.bookingNumber}?`
          }
          description={
            confirmAction === "cancel"
              ? "This will update the reservation status to cancelled. Room inventory will be freed up."
              : "This action cannot be undone. The booking record will be removed from the system."
          }
          confirmText={confirmAction === "cancel" ? "Cancel Reservation" : "Delete Booking"}
        />
      </AppShell>
    </ProtectedRoute>
  );
}

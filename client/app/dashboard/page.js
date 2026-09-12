"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { CardSkeleton, TableRowSkeleton } from "@/components/ui/Skeleton";
import CreateBookingModal from "@/components/bookings/CreateBookingModal";
import bookingApi from "@/services/bookingApi";
import roomApi from "@/services/roomApi";
import guestApi from "@/services/guestApi";
import { getErrorMessage } from "@/services/api";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  DollarSign,
  CalendarCheck,
  BedDouble,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Plus,
  ArrowRight,
  TrendingUp,
  Layers,
  ChevronRight,
  AlertCircle
} from "lucide-react";

export default function DashboardPage() {
  const { user, role, staffProfile } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    occupancyRate: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    cleaningRooms: 0,
    maintenanceRooms: 0,
    totalRooms: 0,
    pendingBookings: 0,
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [bookingStatusData, setBookingStatusData] = useState([]);
  const [roomStatusData, setRoomStatusData] = useState([]);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // If role is guest, redirect to personal bookings
  useEffect(() => {
    if (role === "guest") {
      router.push("/bookings");
    }
  }, [role, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [bookingsRes, roomsRes, guestsRes] = await Promise.all([
        bookingApi.getAllBookings({ limit: 100, sortBy: "createdAt", sortOrder: "desc" }).catch(() => ({ data: { data: { bookings: [] } } })),
        roomApi.getRooms({ limit: 100 }).catch(() => ({ data: { data: { rooms: [] } } })),
        guestApi.getAllGuests({ limit: 100 }).catch(() => ({ data: { data: { guests: [] } } })),
      ]);

      const bookings = bookingsRes.data?.data?.bookings || [];
      const rooms = roomsRes.data?.data?.rooms || [];

      // Calculate Metrics
      let revenue = 0;
      let pendingCount = 0;
      const statusCounts = {
        pending: 0,
        confirmed: 0,
        checked_in: 0,
        checked_out: 0,
        cancelled: 0,
      };

      bookings.forEach((b) => {
        if (["confirmed", "checked_in", "checked_out"].includes(b.status)) {
          revenue += b.totalPrice || 0;
        }
        if (b.status === "pending") {
          pendingCount += 1;
        }
        if (statusCounts[b.status] !== undefined) {
          statusCounts[b.status] += 1;
        }
      });

      let avail = 0;
      let occupied = 0;
      let cleaning = 0;
      let maint = 0;

      rooms.forEach((r) => {
        if (r.status === "available") avail += 1;
        else if (r.status === "occupied") occupied += 1;
        else if (r.status === "cleaning") cleaning += 1;
        else if (r.status === "maintenance") maint += 1;
      });

      const totalRoomsCount = rooms.length || 1;
      const occupancy = Math.round((occupied / totalRoomsCount) * 100);

      setStats({
        totalRevenue: revenue,
        totalBookings: bookings.length,
        occupancyRate: occupancy,
        availableRooms: avail,
        occupiedRooms: occupied,
        cleaningRooms: cleaning,
        maintenanceRooms: maint,
        totalRooms: rooms.length,
        pendingBookings: pendingCount,
      });

      setRecentBookings(bookings.slice(0, 5));

      // Bar Chart: Booking statuses
      setBookingStatusData([
        { name: "Pending", count: statusCounts.pending, color: "#d97706" },
        { name: "Confirmed", count: statusCounts.confirmed, color: "#059669" },
        { name: "Checked In", count: statusCounts.checked_in, color: "#3b82f6" },
        { name: "Checked Out", count: statusCounts.checked_out, color: "#64748b" },
        { name: "Cancelled", count: statusCounts.cancelled, color: "#e11d48" },
      ]);

      // Pie Chart: Room Status
      setRoomStatusData([
        { name: "Available", value: avail || (rooms.length === 0 ? 1 : 0), color: "#059669" },
        { name: "Occupied", value: occupied, color: "#4f46e5" },
        { name: "Cleaning", value: cleaning, color: "#d97706" },
        { name: "Maintenance", value: maint, color: "#e11d48" },
      ].filter((item) => item.value > 0));

      // Area Chart: Monthly Revenue (computed or grouped by month)
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyBuckets = {};
      const currentMonthIdx = new Date().getMonth();

      // Seed last 6 months
      for (let i = 5; i >= 0; i--) {
        const mIdx = (currentMonthIdx - i + 12) % 12;
        monthlyBuckets[months[mIdx]] = 0;
      }

      bookings.forEach((b) => {
        if (b.createdAt && ["confirmed", "checked_in", "checked_out"].includes(b.status)) {
          const date = new Date(b.createdAt);
          const monthName = months[date.getMonth()];
          if (monthlyBuckets[monthName] !== undefined) {
            monthlyBuckets[monthName] += b.totalPrice || 0;
          }
        }
      });

      const trendData = Object.keys(monthlyBuckets).map((m) => ({
        month: m,
        revenue: monthlyBuckets[m],
      }));

      // If all buckets are 0 (e.g. fresh database), seed current month with calculated total for meaningful visualization
      if (trendData.every((d) => d.revenue === 0) && revenue > 0) {
        trendData[trendData.length - 1].revenue = revenue;
      }

      setRevenueData(trendData);
    } catch (err) {
      console.error("Dashboard data fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fast booking actions from dashboard
  const handleBookingAction = async (bookingId, action) => {
    try {
      setActionLoading(bookingId);
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
      fetchDashboardData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const COLORS = ["#059669", "#4f46e5", "#d97706", "#e11d48"];

  return (
    <ProtectedRoute allowedRoles={["owner", "manager", "receptionist"]}>
      <AppShell
        title="Executive & Operations Dashboard"
        subtitle={`Welcome, ${staffProfile?.firstName || user?.email?.split("@")[0] || "Team Member"} • Hotel Control Center`}
      >
        <div className="space-y-8">
          {/* Quick Action Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-card">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c6838]">
                Real-Time Operations
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Hotel Performance Overview
              </h2>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="gold"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setBookingModalOpen(true)}
              >
                New Reservation
              </Button>
              {role === "owner" && (
                <Link href="/rooms/manage">
                  <Button variant="outline" size="sm" leftIcon={<BedDouble className="h-4 w-4" />}>
                    Room Management
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* ===================================================
              1. TOP STATISTIC KPI CARDS
          =================================================== */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Total Revenue */}
              <Card className="hover:border-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Revenue
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#8c6838] flex items-center justify-center">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {stats.totalRevenue.toLocaleString()} <span className="text-xs font-semibold text-slate-500">ETB</span>
                  </p>
                  <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>From confirmed & checked-in stays</span>
                  </p>
                </div>
              </Card>

              {/* Total Bookings */}
              <Card className="hover:border-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Bookings
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CalendarCheck className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {stats.totalBookings}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    {stats.pendingBookings} pending review
                  </p>
                </div>
              </Card>

              {/* Occupancy Rate */}
              <Card className="hover:border-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Occupancy Rate
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {stats.occupancyRate}%
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    {stats.occupiedRooms} of {stats.totalRooms} rooms active
                  </p>
                </div>
              </Card>

              {/* Available Rooms */}
              <Card className="hover:border-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Available Rooms
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <BedDouble className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-extrabold text-emerald-600 tracking-tight">
                    {stats.availableRooms}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    {stats.cleaningRooms} cleaning, {stats.maintenanceRooms} maintenance
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* ===================================================
              2. VISUAL ANALYTICS (RECHARTS)
          =================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Trend (Area Chart - 2 cols) */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle subtitle="Monthly gross booking revenue in ETB">
                  Revenue Growth Trajectory
                </CardTitle>
                <Badge variant="gold" size="sm">Gross ETB</Badge>
              </CardHeader>

              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#b48c58" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#b48c58" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(val) => [`${Number(val).toLocaleString()} ETB`, "Revenue"]}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        color: "#ffffff",
                        borderRadius: "12px",
                        fontSize: "12px",
                        border: "none",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#b48c58"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Room Status Distribution (Pie Chart - 1 col) */}
            <Card>
              <CardHeader>
                <CardTitle subtitle="Current state of all hotel rooms">
                  Room Allocation
                </CardTitle>
              </CardHeader>

              <div className="h-64 sm:h-72 w-full flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={roomStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {roomStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [val, name]}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        color: "#ffffff",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] text-slate-600">
                  {roomStatusData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      <span>{d.name}: <strong>{d.value}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Bar Chart: Bookings by Status */}
          <Card>
            <CardHeader>
              <CardTitle subtitle="Distribution of reservation lifecycles across the hotel">
                Bookings by Status
              </CardTitle>
              <Link href="/bookings">
                <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-4 w-4" />}>
                  Manage All Bookings
                </Button>
              </Link>
            </CardHeader>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingStatusData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    formatter={(val) => [val, "Count"]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#ffffff",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {bookingStatusData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* ===================================================
              3. RECENT ACTIVITY & OPERATIONAL ACTIONS TABLE
          =================================================== */}
          <Card>
            <CardHeader>
              <CardTitle subtitle="Latest guest reservations and quick check-in actions">
                Recent Bookings Activity
              </CardTitle>
              <Link href="/bookings">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  View All ({stats.totalBookings})
                </Button>
              </Link>
            </CardHeader>

            {loading ? (
              <div className="divide-y divide-slate-100">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="py-4 space-y-2 animate-pulse">
                    <div className="h-4 w-48 bg-slate-200 rounded" />
                    <div className="h-3 w-64 bg-slate-100 rounded" />
                  </div>
                ))}
              </div>
            ) : recentBookings.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-3 px-4">Booking #</th>
                        <th className="py-3 px-4">Guest</th>
                        <th className="py-3 px-4">Room</th>
                        <th className="py-3 px-4">Dates</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {recentBookings.map((b) => (
                        <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {b.bookingNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-800">
                              {b.guest?.firstName} {b.guest?.lastName}
                            </p>
                            <p className="text-[11px] text-slate-400">{b.guest?.phone}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800">
                              Room {b.room?.roomNumber || "—"}
                            </span>
                            <span className="text-[11px] text-slate-400 block capitalize">
                              {b.room?.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {new Date(b.checkInDate).toLocaleDateString()} →{" "}
                            {new Date(b.checkOutDate).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {b.totalPrice?.toLocaleString()} {b.currency}
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge status={b.status} size="sm" />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {b.status === "pending" && (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  isLoading={actionLoading === b._id}
                                  onClick={() => handleBookingAction(b._id, "confirm")}
                                >
                                  Confirm
                                </Button>
                              )}
                              {b.status === "confirmed" && (
                                <Button
                                  size="sm"
                                  variant="gold"
                                  isLoading={actionLoading === b._id}
                                  onClick={() => handleBookingAction(b._id, "check-in")}
                                >
                                  Check In
                                </Button>
                              )}
                              {b.status === "checked_in" && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  isLoading={actionLoading === b._id}
                                  onClick={() => handleBookingAction(b._id, "check-out")}
                                >
                                  Check Out
                                </Button>
                              )}
                              <Link href={`/bookings/${b._id}`}>
                                <Button size="sm" variant="outline">
                                  Details
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Transformed Cards View */}
                <div className="md:hidden divide-y divide-slate-100">
                  {recentBookings.map((b) => (
                    <div key={b._id} className="py-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">
                          {b.bookingNumber}
                        </span>
                        <Badge status={b.status} size="sm" />
                      </div>

                      <div className="text-xs text-slate-600 space-y-1">
                        <p>
                          <strong className="text-slate-800">Guest:</strong> {b.guest?.firstName} {b.guest?.lastName} ({b.guest?.phone})
                        </p>
                        <p>
                          <strong className="text-slate-800">Room:</strong> Room {b.room?.roomNumber || "—"} ({b.room?.type})
                        </p>
                        <p>
                          <strong className="text-slate-800">Stay:</strong> {new Date(b.checkInDate).toLocaleDateString()} - {new Date(b.checkOutDate).toLocaleDateString()}
                        </p>
                        <p>
                          <strong className="text-slate-800">Total:</strong> {b.totalPrice?.toLocaleString()} {b.currency}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        {b.status === "pending" && (
                          <Button
                            size="sm"
                            variant="primary"
                            isLoading={actionLoading === b._id}
                            onClick={() => handleBookingAction(b._id, "confirm")}
                          >
                            Confirm
                          </Button>
                        )}
                        {b.status === "confirmed" && (
                          <Button
                            size="sm"
                            variant="gold"
                            isLoading={actionLoading === b._id}
                            onClick={() => handleBookingAction(b._id, "check-in")}
                          >
                            Check In
                          </Button>
                        )}
                        {b.status === "checked_in" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            isLoading={actionLoading === b._id}
                            onClick={() => handleBookingAction(b._id, "check-out")}
                          >
                            Check Out
                          </Button>
                        )}
                        <Link href={`/bookings/${b._id}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full">
                            Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon={<CalendarCheck className="h-6 w-6" />}
                title="No bookings recorded yet"
                description="Create the first reservation to begin tracking hotel occupancy and revenue analytics."
                actionLabel="Create Reservation"
                onAction={() => setBookingModalOpen(true)}
              />
            )}
          </Card>
        </div>

        {/* Create Booking Modal */}
        <CreateBookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          onBookingSuccess={() => fetchDashboardData()}
        />
      </AppShell>
    </ProtectedRoute>
  );
}

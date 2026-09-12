"use client";

import React, { Suspense, useEffect, useState } from "react";
import OptimizedImage from "@/components/ui/OptimizedImage";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import CreateBookingModal from "@/components/bookings/CreateBookingModal";
import roomApi from "@/services/roomApi";
import { useAuth } from "@/context/AuthContext";
import {
  BedDouble,
  Search,
  Users,
  Sparkles,
  Layers,
  ArrowUpDown,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function RoomsCatalogContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "";

  const { role, isAuthenticated } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [sortBy, setSortBy] = useState("roomNumber");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);

      if (searchTerm.trim()) {
        const response = await roomApi.searchRooms(searchTerm.trim());

        const searchResults = response?.data?.data || [];

        const filteredResults = typeFilter
          ? searchResults.filter((room) => room.type === typeFilter)
          : searchResults;

        setRooms(filteredResults);

        setMeta({
          page: 1,
          totalPages: 1,
          total: filteredResults.length,
          hasPreviousPage: false,
          hasNextPage: false,
        });

        return;
      }

      const query = {
        page,
        limit: 9,
        sortBy,
        sortOrder,
      };

      const response = await roomApi.getRooms(query);

      const data = response?.data?.data;

      let fetchedRooms = data?.rooms || [];

      if (typeFilter) {
        fetchedRooms = fetchedRooms.filter((room) => room.type === typeFilter);
      }

      setRooms(fetchedRooms);

      setMeta(
        data?.meta || {
          page: 1,
          totalPages: 1,
          total: fetchedRooms.length,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      );
    } catch (error) {
      console.error("Error fetching rooms:", error);

      setRooms([]);

      setMeta({
        page: 1,
        totalPages: 1,
        total: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [page, sortBy, sortOrder, typeFilter]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (page !== 1) {
      setPage(1);
      return;
    }

    fetchRooms();
  };

  const handleBook = (room) => {
    setSelectedRoom(room);
    setBookingModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setSortBy("roomNumber");
    setSortOrder("asc");
    setPage(1);
  };

  const canManage =
    isAuthenticated && ["owner", "manager", "receptionist"].includes(role);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafc]">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#8c6838]">
              Accommodation Catalog
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
              Rooms & Luxury Suites
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Discover our bespoke accommodations with real-time rate
              verification
            </p>
          </div>

          {canManage && (
            <div className="flex items-center gap-2">
              <Link href="/rooms/manage">
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Layers className="h-4 w-4" />}
                >
                  Manage Room Inventory
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="my-8 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <form
            onSubmit={handleSearchSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5"
          >
            <div className="lg:col-span-2">
              <Input
                id="search"
                placeholder="Search by room number, type, or amenities..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>

            <Select
              id="typeFilter"
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                setPage(1);
              }}
              options={[
                {
                  value: "",
                  label: "All Room Types",
                },
                {
                  value: "single",
                  label: "Single Suites",
                },
                {
                  value: "double",
                  label: "Double Deluxe",
                },
                {
                  value: "family",
                  label: "Family Executive",
                },
              ]}
              leftIcon={<Filter className="h-4 w-4" />}
            />

            <Select
              id="sortBy"
              value={`${sortBy}-${sortOrder}`}
              onChange={(event) => {
                const [selectedSortBy, selectedSortOrder] =
                  event.target.value.split("-");

                setSortBy(selectedSortBy);
                setSortOrder(selectedSortOrder);
                setPage(1);
              }}
              options={[
                {
                  value: "roomNumber-asc",
                  label: "Room Number (Low → High)",
                },
                {
                  value: "pricePerNight-asc",
                  label: "Price (Low → High)",
                },
                {
                  value: "pricePerNight-desc",
                  label: "Price (High → Low)",
                },
                {
                  value: "floor-asc",
                  label: "Floor Level (Asc)",
                },
              ]}
              leftIcon={<ArrowUpDown className="h-4 w-4" />}
            />
          </form>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="bg-white rounded-2xl p-5 space-y-4 border border-slate-200 animate-pulse"
              >
                <Skeleton className="h-48 w-full rounded-xl" />

                <Skeleton className="h-5 w-32" />

                <Skeleton className="h-4 w-full" />

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-24 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : rooms.length > 0 ? (
          /* Room Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room, index) => (
              <div
                key={room._id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Room Image - Clickable Link to Room Details */}
                <Link href={`/rooms/${room._id}`} className="h-48 relative overflow-hidden group block">
                  <OptimizedImage
                    src={room.images?.[0]}
                    alt={`Room ${room.roomNumber} - ${room.type} Suite`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority={index === 0}
                  />

                  {/* Image Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10 pointer-events-none z-10" />

                  {/* Top Information */}
                  <div className="relative z-20 flex items-center justify-between p-5">
                    <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-white/80 text-slate-900 backdrop-blur-sm">
                      Floor {room.floor}
                    </span>

                    <Badge status={room.status} size="sm" />
                  </div>

                  {/* Room Information */}
                  <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-[#d8b47a]">
                      {room.type} Suite
                    </span>

                    <h3 className="text-xl font-bold text-white tracking-tight group-hover:underline">
                      Room {room.roomNumber}
                    </h3>
                  </div>
                </Link>

                {/* Room Details */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-5">
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                      {room.description ||
                        `Impeccably designed ${room.type} room featuring modern amenities, luxury finishes, and dedicated room service.`}
                    </p>

                    {/* Capacity & Type */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-slate-400" />

                        <span>Max {room.capacity} Guests</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <BedDouble className="h-3.5 w-3.5 text-slate-400" />

                        <span className="capitalize">{room.type}</span>
                      </div>
                    </div>

                    {/* Amenities */}
                    {room.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {room.amenities.map((amenity, index) => (
                          <span
                            key={`${room._id}-amenity-${index}`}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-600"
                          >
                            <Sparkles className="h-2.5 w-2.5 text-[#b48c58]" />

                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pricing & Booking */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Per Night
                      </span>

                      <p className="text-lg font-bold text-slate-900">
                        {typeof room.pricePerNight === "number"
                          ? room.pricePerNight.toLocaleString()
                          : "—"}{" "}
                        <span className="text-xs font-normal text-slate-500">
                          ETB
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/rooms/${room._id}`}>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>

                      <Button
                        size="sm"
                        variant={
                          room.status === "available" ? "gold" : "secondary"
                        }
                        disabled={room.status !== "available"}
                        onClick={() => handleBook(room)}
                      >
                        {room.status === "available"
                          ? "Book Room"
                          : "Unavailable"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <EmptyState
            icon={<BedDouble className="h-6 w-6" />}
            title="No rooms match your filter"
            description="Try changing the room category or clearing your search term to see more available accommodations."
            actionLabel="Reset Filters"
            onAction={handleResetFilters}
          />
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && !searchTerm.trim() && (
          <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-slate-200">
            <span className="text-xs text-slate-500">
              Showing page <strong>{meta.page}</strong> of{" "}
              <strong>{meta.totalPages}</strong> (Total: {meta.total} rooms)
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!meta.hasPreviousPage}
                onClick={() => {
                  setPage((currentPage) => Math.max(currentPage - 1, 1));
                }}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={!meta.hasNextPage}
                onClick={() => {
                  setPage((currentPage) => currentPage + 1);
                }}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <CreateBookingModal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedRoom(null);
        }}
        preselectedRoom={selectedRoom}
        onBookingSuccess={fetchRooms}
      />
    </div>
  );
}

export default function RoomsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xs text-slate-400">Loading rooms catalog...</p>
        </div>
      }
    >
      <RoomsCatalogContent />
    </Suspense>
  );
}

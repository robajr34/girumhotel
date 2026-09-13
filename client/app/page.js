"use client";

import React, { useState, useEffect } from "react";
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
import menuApi from "@/services/menuApi";
import {
  Hotel,
  BedDouble,
  Users,
  Utensils,
  Sparkles,
  ShieldCheck,
  CalendarCheck,
  ArrowRight,
  Search,
  CheckCircle,
  Clock,
  Layers,
  ChevronRight,
  CalendarDays,
  Coffee,
  Croissant,
  Soup,
  Beef,
  Wine,
  CupSoda,
  CakeSlice,
  Flame,
} from "lucide-react";

export default function LandingPage() {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [featuredMenus, setFeaturedMenus] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMenus, setLoadingMenus] = useState(true);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);

  // Search widget state
  const [searchParams, setSearchParams] = useState({
    type: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
  });

   const categories = [
      {
        key: "all",
        label: "All Items",
        icon: Utensils,
        description:
          "Explore our complete selection of food and beverages.",
      },
      {
        key: "breakfast",
        label: "Breakfast",
        icon: Croissant,
        description: "Start your day with a delicious breakfast.",
      },
      {
        key: "lunch",
        label: "Lunch",
        icon: Soup,
        description:
          "Freshly prepared meals for a satisfying afternoon.",
      },
      {
        key: "dinner",
        label: "Dinner",
        icon: Flame,
        description: "Enjoy our selection of evening dishes.",
      },
      {
        key: "meat",
        label: "Meat & Grill",
        icon: Beef,
        description:
          "Grilled and expertly prepared meat selections.",
      },
      {
        key: "beverage",
        label: "Beverages",
        icon: CupSoda,
        description:
          "Refreshing drinks to complement your meal.",
      },
      {
        key: "alcohol",
        label: "Alcohol",
        icon: Wine,
        description:
          "A selection of alcoholic beverages.",
      },
      {
        key: "hot_drink",
        label: "Hot Drink",
        icon: Coffee,
        description:
          "Warm drinks prepared fresh for you.",
      },
      {
        key: "cake",
        label: "Cake",
        icon: CakeSlice,
        description:
          "Sweet treats and freshly prepared desserts.",
      },
    ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingRooms(true);
        const res = await roomApi.getRooms({
          limit: 3,
          sortBy: "roomNumber",
          sortOrder: "asc",
        });
        setFeaturedRooms(res.data?.data?.rooms || []);
      } catch (err) {
        console.error("Failed to load featured rooms", err);
      } finally {
        setLoadingRooms(false);
      }

      try {
        setLoadingMenus(true);
        const res = await menuApi.getMenu({
          limit: 4,
          sortBy: "createdAt",
          sortOrder: "desc",
        });
        setFeaturedMenus(res.data?.data?.menus || []);
      } catch (err) {
        console.error("Failed to load featured menus", err);
      } finally {
        setLoadingMenus(false);
      }
    };

    loadData();
  }, []);

  const handleBookRoom = (room) => {
    setSelectedRoomForBooking(room);
    setBookingModalOpen(true);
  };
  console.log(HOTEL.heroImage);
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafc]">
      <Navbar />

      <main className="flex-1">
        {/* ===================================================
            1. HERO SECTION
        =================================================== */}
        <section className="relative overflow-hidden bg-slate-900 text-white pt-20 pb-28 sm:pb-36 lg:pt-28">
          {HOTEL.heroImage && (
            <div className="absolute inset-0 z-0">
              <OptimizedImage
                src={HOTEL.heroImage}
                alt={`${HOTEL.websiteName || HOTEL.name} Hero View`}
                fill
                priority
                sizes="100vw"
                className="object-cover pointer-events-none"
              />
            </div>
          )}

          {/* Image overlay */}
          {HOTEL.heroImage && (
            <div className="absolute inset-0 bg-slate-950/55 pointer-events-none z-10" />
          )}

          {/* Subtle background luxury gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(180,140,88,0.15),transparent_50%)] pointer-events-none" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(30,41,59,0.5),transparent_50%)] pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/70 text-[#b48c58] text-xs font-semibold mb-6 tracking-wide shadow-inner">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Comfortable Stays & Easy Booking</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.15]">
              Welcome to{" "}
              <span
                className="text-[#b48c58]"
                style={{
                  WebkitTextStroke: "1px #fcf9f9",
                }}
              >
                {HOTEL.name}
              </span>
            </h1>

            <p className="mt-6 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {HOTEL.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/rooms">
                <Button
                  size="lg"
                  variant="gold"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Explore Rooms & Suites
                </Button>
              </Link>

              <Link href="/menu">
                <Button size="lg" variant="outline">
                  View Dining Menu
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ===================================================
            QUICK SEARCH / BOOKING WIDGET (Overlapping Hero)
        =================================================== */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 z-20">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-5 sm:p-7 backdrop-blur-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                  Room Type
                </label>
                <select
                  value={searchParams.type}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, type: e.target.value })
                  }
                  className="w-full text-xs font-semibold bg-slate-50 rounded-xl border border-slate-200 py-3 px-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">All Categories</option>
                  <option value="single">Single Suite</option>
                  <option value="double">Double Deluxe</option>
                  <option value="family">Family Executive</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                  Check In
                </label>
                <input
                  type="date"
                  value={searchParams.checkIn}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setSearchParams({
                      ...searchParams,
                      checkIn: e.target.value,
                    })
                  }
                  className="w-full text-xs font-semibold bg-slate-50 rounded-xl border border-slate-200 py-3 px-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                  Check Out
                </label>
                <input
                  type="date"
                  value={searchParams.checkOut}
                  min={
                    searchParams.checkIn ||
                    new Date().toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    setSearchParams({
                      ...searchParams,
                      checkOut: e.target.value,
                    })
                  }
                  className="w-full text-xs font-semibold bg-slate-50 rounded-xl border border-slate-200 py-3 px-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <Link
                  href={`/rooms${searchParams.type ? `?type=${searchParams.type}` : ""}`}
                  className="w-full block"
                >
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    rightIcon={<Search className="h-4 w-4" />}
                  >
                    Check Availability
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            2. VALUE PROPOSITIONS & AMENITIES
        =================================================== */}
        <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8c6838]">
              The {HOTEL.websiteName} Standard
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">
              Designed for Comfortable Stays & Practical Hotel Operations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-3 leading-relaxed">
              Browse rooms, view dining options, and manage reservations in one
              place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:border-slate-300">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#8c6838] flex items-center justify-center mb-5">
                <BedDouble className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Rooms & Suites
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Browse available rooms, capacities, amenities, and nightly
                rates.
              </p>
            </Card>

            <Card className="hover:border-slate-300">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <Utensils className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Dining Menu
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                View available dishes, categories, prices, and preparation
                times.
              </p>
            </Card>

            <Card className="hover:border-slate-300">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Booking & Account Access
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Search stays, create reservations, and sign in to manage
                bookings.
              </p>
            </Card>
          </div>
        </section>

        {/* ===================================================
            3. FEATURED ROOMS SHOWCASE
        =================================================== */}
        <section className="py-20 bg-slate-100/60 border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#8c6838]">
                  Accommodation Showcase
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
                  Featured Rooms & Suites
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Hand-selected rooms ready for instant online reservation
                </p>
              </div>
              <Link href="/rooms">
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  View All Rooms
                </Button>
              </Link>
            </div>

            {loadingRooms ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-5 space-y-4 border border-slate-200"
                  >
                    <Skeleton className="h-44 w-full rounded-xl" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between pt-4 border-t border-slate-100">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-8 w-24 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : featuredRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredRooms.map((room, index) => (
                  <div
                    key={room._id}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-slate-300 transition-all flex flex-col overflow-hidden"
                  >
                    {/* Room Card Top Accent - Clickable to Single Room View */}
                    <Link
                      href={`/rooms/${room._id}`}
                      className="h-44 relative overflow-hidden group block"
                    >
                      <OptimizedImage
                        src={room.images?.[0]}
                        alt={`Room ${room.roomNumber} - ${room.type} Suite at ${HOTEL.name}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        priority={index === 0}
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 z-10 pointer-events-none" />
                      <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-[#b48c58]/15 rounded-full blur-2xl z-10 pointer-events-none" />
                      <div className="flex items-center justify-between z-20 relative p-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-white/10 text-white backdrop-blur-xs">
                          Floor {room.floor}
                        </span>
                        <Badge status={room.status} size="sm" />
                      </div>
                      <div className="z-20 relative px-4 pb-4">
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#b48c58]">
                          {room.type} Room
                        </span>
                        <h3 className="text-xl font-bold text-white tracking-tight group-hover:underline">
                          Room {room.roomNumber}
                        </h3>
                      </div>
                    </Link>

                    {/* Room Info */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-5">
                      <div className="space-y-3">
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {room.description ||
                            `Experience premier hospitality in our tastefully appointed ${room.type} suite.`}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-slate-400" />
                            <span>Max {room.capacity} Guests</span>
                          </div>
                          {room.amenities?.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-[#b48c58]" />
                              <span>
                                {room.amenities.slice(0, 2).join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pricing & Booking Trigger */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            Rate per night
                          </span>
                          <p className="text-base font-bold text-slate-900">
                            {room.pricePerNight?.toLocaleString()}{" "}
                            <span className="text-xs font-normal text-slate-500">
                              ETB
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href={`/rooms/${room._id}`}>
                            <Button size="sm" variant="outline">
                              Details
                            </Button>
                          </Link>

                          <Button
                            size="sm"
                            variant={
                              room.status === "available" ? "gold" : "secondary"
                            }
                            disabled={room.status !== "available"}
                            onClick={() => handleBookRoom(room)}
                          >
                            {room.status === "available"
                              ? "Book Now"
                              : "Unavailable"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
                <BedDouble className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-800">
                  Rooms updating
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Our inventory is being refreshed. Please check back shortly.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ===================================================
            4. RESTAURANT & DINING HIGHLIGHT
        =================================================== */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#8c6838]">
                Culinary Delights
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
                Restaurant & In-Room Dining
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Crafted by master chefs using premium local and international
                ingredients
              </p>
            </div>
            <Link href="/menu">
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Full Dining Menu
              </Button>
            </Link>
          </div>
          {loadingMenus ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-9 w-9 rounded-xl" />
                    <Skeleton className="h-4 w-12" />
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredMenus.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredMenus.map((item) => {
                const category = categories.find(
                  (cat) => cat.key === item.category,
                );

                const CategoryIcon = category?.icon || Utensils;

                return (
                  <div
                    key={item._id}
                    className="group relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col"
                  >
                    {/* Featured Accent */}
                    <div className="absolute top-0 left-5 right-5 h-0.5 bg-gradient-to-r from-transparent via-[#b48c58] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Top */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="h-11 w-11 rounded-xl bg-[#fbf7f2] border border-[#e8d8c3] flex items-center justify-center group-hover:bg-[#f7efe4] transition-colors">
                        <CategoryIcon className="h-5 w-5 text-[#8c6838]" />
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{item.preparationTime || 15} min</span>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="mt-4">
                      <Badge status={item.category} size="sm">
                        {category?.label || item.category}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="mt-2 flex-1">
                      <h4 className="text-base font-bold text-slate-900 tracking-tight">
                        {item.name}
                      </h4>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-2">
                        {item.description ||
                          "Prepared fresh to order with authentic seasonal ingredients."}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 mt-5 border-t border-slate-100 flex items-end justify-between gap-3">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Price
                        </span>

                        <span className="text-base font-bold text-[#8c6838]">
                          {item.price?.toLocaleString()}
                          <span className="text-[11px] font-medium text-slate-400 ml-1">
                            ETB
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item.isAvailable ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        />

                        <span
                          className={`text-[11px] font-medium ${
                            item.isAvailable
                              ? "text-emerald-600"
                              : "text-slate-400"
                          }`}
                        >
                          {item.isAvailable ? "Available" : "Sold out"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="relative overflow-hidden bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#fbf7f2] via-transparent to-transparent pointer-events-none" />

              <div className="relative">
                <div className="h-12 w-12 rounded-2xl bg-[#fbf7f2] border border-[#e8d8c3] flex items-center justify-center mx-auto mb-3">
                  <Utensils className="h-5 w-5 text-[#8c6838]" />
                </div>

                <h4 className="text-sm font-bold text-slate-900">
                  Our menu is being refreshed
                </h4>

                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Our culinary team is currently updating today's selection.
                  Please check back shortly.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ===================================================
            5. HOTEL MANAGEMENT PLATFORM HIGHLIGHT
        =================================================== */}
        <section className="bg-slate-900 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          {" "}
          {/* Header */}{" "}
          <div className="flex items-center justify-between pb-5 border-b border-slate-700/80">
            {" "}
            <div>
              {" "}
              <div className="flex items-center gap-2 mb-1.5">
                {" "}
                <span className="h-1.5 w-1.5 rounded-full bg-[#b48c58] shadow-[0_0_8px_rgba(180,140,88,0.8)]" />{" "}
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#b48c58]">
                  {" "}
                  Management Overview{" "}
                </span>{" "}
              </div>{" "}
              <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {" "}
                Everything in One Workspace{" "}
              </h4>{" "}
            </div>{" "}
            <Badge variant="success" size="sm">
              {" "}
              Ready{" "}
            </Badge>{" "}
          </div>{" "}
          {/* Feature Status */}{" "}
          <div className="space-y-2.5">
            {" "}
            {/* Room Management */}{" "}
            <div className="group flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-emerald-500/30 hover:bg-slate-800 transition-all duration-200">
              {" "}
              <div className="flex items-center gap-3 min-w-0">
                {" "}
                <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center">
                  {" "}
                  <CheckCircle className="h-4 w-4 text-emerald-400" />{" "}
                </div>{" "}
                <div className="min-w-0">
                  {" "}
                  <p className="text-xs font-semibold text-white">
                    {" "}
                    Room Management{" "}
                  </p>{" "}
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {" "}
                    Availability & status tracking{" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              <Badge status="available" size="sm">
                {" "}
                Active{" "}
              </Badge>{" "}
            </div>{" "}
            {/* Reservations */}{" "}
            <div className="group flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-[#b48c58]/40 hover:bg-slate-800 transition-all duration-200">
              {" "}
              <div className="flex items-center gap-3 min-w-0">
                {" "}
                <div className="h-10 w-10 shrink-0 rounded-xl bg-[#b48c58]/10 border border-[#b48c58]/10 flex items-center justify-center">
                  {" "}
                  <CalendarDays className="h-4 w-4 text-[#b48c58]" />{" "}
                </div>{" "}
                <div className="min-w-0">
                  {" "}
                  <p className="text-xs font-semibold text-white">
                    {" "}
                    Reservations{" "}
                  </p>{" "}
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {" "}
                    Centralized booking management{" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              <Badge variant="gold" size="sm">
                {" "}
                Organized{" "}
              </Badge>{" "}
            </div>{" "}
            {/* Staff Workspace */}{" "}
            <div className="group flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-indigo-500/30 hover:bg-slate-800 transition-all duration-200">
              {" "}
              <div className="flex items-center gap-3 min-w-0">
                {" "}
                <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center">
                  {" "}
                  <Users className="h-4 w-4 text-indigo-400" />{" "}
                </div>{" "}
                <div className="min-w-0">
                  {" "}
                  <p className="text-xs font-semibold text-white">
                    {" "}
                    Staff Workspace{" "}
                  </p>{" "}
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {" "}
                    Role-based team access{" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              <Badge variant="info" size="sm">
                {" "}
                Connected{" "}
              </Badge>{" "}
            </div>{" "}
          </div>{" "}
          {/* Operations Flow */}{" "}
          <div className="pt-2">
            {" "}
            <div className="flex items-center justify-between mb-3">
              {" "}
              <div>
                {" "}
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  {" "}
                  Daily Operations{" "}
                </p>{" "}
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {" "}
                  Connected workflows across your team{" "}
                </p>{" "}
              </div>{" "}
              <Badge variant="gold" size="sm">
                {" "}
                Streamlined{" "}
              </Badge>{" "}
            </div>{" "}
            {/* Workflow Progress */}{" "}
            <div className="relative h-2 w-full rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
              {" "}
              <div className="absolute inset-y-0 left-0 w-[88%] rounded-full bg-gradient-to-r from-[#8f6d43] via-[#b48c58] to-[#c9a66d]" />{" "}
              <div className="absolute top-0 left-[88%] h-full w-6 bg-white/20 blur-sm" />{" "}
            </div>{" "}
            {/* Workflow Labels */}{" "}
            <div className="grid grid-cols-3 gap-2 mt-3">
              {" "}
              <div className="flex items-center gap-1.5">
                {" "}
                <span className="h-1.5 w-1.5 rounded-full bg-[#b48c58]" />{" "}
                <span className="text-[9px] text-slate-500">
                  {" "}
                  Front desk{" "}
                </span>{" "}
              </div>{" "}
              <div className="flex items-center justify-center gap-1.5">
                {" "}
                <span className="h-1.5 w-1.5 rounded-full bg-[#b48c58]" />{" "}
                <span className="text-[9px] text-slate-500">
                  {" "}
                  Housekeeping{" "}
                </span>{" "}
              </div>{" "}
              <div className="flex items-center justify-end gap-1.5">
                {" "}
                <span className="h-1.5 w-1.5 rounded-full bg-[#b48c58]" />{" "}
                <span className="text-[9px] text-slate-500">
                  {" "}
                  Management{" "}
                </span>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          {/* Bottom Insight */}{" "}
          <div className="relative overflow-hidden rounded-2xl border border-[#b48c58]/15 bg-[#b48c58]/5 p-4">
            {" "}
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#b48c58]/5 blur-2xl" />{" "}
            <div className="relative flex items-start gap-3">
              {" "}
              <div className="h-9 w-9 shrink-0 rounded-xl bg-[#b48c58]/10 border border-[#b48c58]/10 flex items-center justify-center">
                {" "}
                <Layers className="h-4 w-4 text-[#b48c58]" />{" "}
              </div>{" "}
              <div>
                {" "}
                <p className="text-xs font-semibold text-slate-200">
                  {" "}
                  One connected workflow{" "}
                </p>{" "}
                <p className="text-[10px] leading-relaxed text-slate-400 mt-1">
                  {" "}
                  Keep reservations, rooms, staff, and daily operations
                  organized from a single workspace.{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </section>
      </main>

      <Footer />

      {/* Booking Modal */}
      <CreateBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedRoom={selectedRoomForBooking}
      />
    </div>
  );
}

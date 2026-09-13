"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HOTEL } from "@/constants/hotel";
import { useAuth } from "@/context/AuthContext";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  Hotel,
  LayoutDashboard,
  CalendarDays,
  BedDouble,
  Users,
  UserCheck,
  Utensils,
  ShieldCheck,
  UserRound,
  LogOut,
  Menu as MenuIcon,
  X,
  Compass,
  ChevronRight
} from "lucide-react";

export default function AppShell({ children, title, subtitle }) {
  const pathname = usePathname();
  const { user, role, staffProfile, logout } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Define navigation items filtered by user role
  const allNavItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      roles: ["owner", "manager", "receptionist"],
    },
    {
      label: "Bookings",
      href: "/bookings",
      icon: <CalendarDays className="h-4 w-4" />,
      roles: ["owner", "manager", "receptionist", "guest"],
    },
    {
      label: "Room Inventory",
      href: "/rooms/manage",
      icon: <BedDouble className="h-4 w-4" />,
      roles: ["owner", "manager", "receptionist"],
    },
    {
      label: "Guest Directory",
      href: "/guests",
      icon: <Users className="h-4 w-4" />,
      roles: ["owner", "manager"],
    },
    {
      label: "Staff Directory",
      href: "/staff",
      icon: <UserCheck className="h-4 w-4" />,
      roles: ["owner", "manager"],
    },
    {
      label: "Menu Management",
      href: "/menu/manage",
      icon: <Utensils className="h-4 w-4" />,
      roles: ["owner", "manager"],
    },
    {
      label: "System Users",
      href: "/users",
      icon: <ShieldCheck className="h-4 w-4" />,
      roles: ["owner", "manager"],
    },
    {
      label: "Public Rooms",
      href: "/rooms",
      icon: <Compass className="h-4 w-4" />,
      roles: ["owner", "manager", "receptionist", "guest"],
    },
    {
      label: "Menus",
      href: "/menu",
      icon: <Utensils className="h-4 w-4" />,
      roles: ["receptionist", "guest"],
    },
    {
      label: "Profile & Account",
      href: "/profile",
      icon: <UserRound className="h-4 w-4" />,
      roles: ["owner", "manager", "receptionist", "guest"],
    },
  ];

  const visibleNavItems = allNavItems.filter(
    (item) => !item.roles || item.roles.includes(role),
  );

  const displayName =
    staffProfile?.firstName
      ? `${staffProfile.firstName} ${staffProfile.lastName || ""}`
      : user?.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen flex bg-[#fafafc]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-slate-200/80 shrink-0 z-30 justify-between">
        <div className="flex flex-col flex-1">
          {/* Brand Header */}
          <div className="h-18 flex items-center gap-3 px-6 border-b border-slate-100">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center group-hover:bg-[#8c6838] transition-colors">
                <Hotel className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-slate-900">
                  {HOTEL.websiteName}
                </span>
                <span className="text-[9px] font-semibold tracking-widest uppercase text-[#8c6838]">
                  Management Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-2 block">
              Workstation Menu
            </span>
            {visibleNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  item.href !== "/" &&
                  pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="h-3 w-3 text-slate-400" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Account & Logout Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between gap-3">
            <Link href="/profile" className="flex items-center gap-2.5 min-w-0 flex-1 group">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate group-hover:text-[#8c6838] transition-colors">
                  {displayName}
                </p>
                <div className="mt-0.5">
                  <Badge status={role} size="sm" />
                </div>
              </div>
            </Link>

            <button
              type="button"
              onClick={logout}
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
              aria-label="Open sidebar"
            >
              <MenuIcon className="h-5 w-5" />
            </button>

            <div>
              {title && (
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge status={role} size="md" />
            <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-900 hidden sm:block">
              Hotel Website ↗
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
              onClick={() => setMobileDrawerOpen(false)}
            />

            {/* Drawer */}
            <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between p-4 z-10 animate-in slide-in-from-left duration-200">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                      <Hotel className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {HOTEL.websiteName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {visibleNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileDrawerOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                          isActive
                            ? "bg-slate-900 text-white"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    logout();
                  }}
                  className="w-full text-rose-600 border-rose-200 hover:bg-rose-50"
                  leftIcon={<LogOut className="h-4 w-4" />}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

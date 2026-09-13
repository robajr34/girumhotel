"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { HOTEL } from "@/constants/hotel";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  Hotel,
  Menu as MenuIcon,
  X,
  LayoutDashboard,
  Calendar,
  LogOut,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const { role, isAuthenticated, isLoading, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Rooms & Suites", href: "/rooms" },
    { label: "Dining & Menu", href: "/menu" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-2xl text-white flex items-center justify-center shadow-sm group-hover:bg-[#f1f5f9] transition-colors">
            {HOTEL.logo ? (
              <Image
                src={HOTEL.logo}
                alt={`${HOTEL.websiteName || HOTEL.name} Logo`}
                width={68}
                height={68}
                className="bg-transparent"
              />
            ) : (
              <Hotel className="h-5 w-5" />
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900">
              {HOTEL.websiteName}
            </span>

            <span className="text-[10px] font-semibold tracking-widest uppercase text-[#8c6838]">
              {HOTEL.location}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/60">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                  isActive
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isLoading ? (
            <div className="h-9 w-24 rounded-xl bg-slate-100 animate-pulse" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href={role === "guest" ? "/bookings" : "/dashboard"}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition-colors"
              >
                {role === "guest" ? (
                  <Calendar className="h-3.5 w-3.5 text-slate-600" />
                ) : (
                  <LayoutDashboard className="h-3.5 w-3.5 text-slate-600" />
                )}

                <span>{role === "guest" ? "My Bookings" : "Dashboard"}</span>

                <Badge status={role} size="sm" />
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-slate-500 hover:text-rose-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>

              <Link href="/rooms">
                <Button variant="gold" size="sm">
                  Book Room
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Mobile Navigation Links */}
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Authentication */}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isLoading ? (
              <div className="h-10 w-full rounded-xl bg-slate-100 animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <Link
                  href={role === "guest" ? "/bookings" : "/dashboard"}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="primary" className="w-full">
                    {role === "guest" ? "My Bookings" : "Go to Dashboard"}
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>

                <Link href="/rooms" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="gold" className="w-full">
                    Book Room
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

import React from "react";
import Link from "next/link";
import { HOTEL } from "@/constants/hotel";
import { Hotel, MapPin, Phone, Mail, MapPinned } from "lucide-react";

export default function Footer() {
  const hasContactDetails =
    HOTEL.contact.phone || HOTEL.contact.email || HOTEL.contact.address;

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-12 border-b border-slate-800">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#b48c58] text-white flex items-center justify-center">
                <Hotel className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-white">
                  {HOTEL.websiteName}
                </span>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[#b48c58]">
                  {HOTEL.location}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {HOTEL.description}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link
                  href="/rooms"
                  className="hover:text-white transition-colors"
                >
                  Rooms
                </Link>
              </li>
              <li>
                <Link
                  href="/menu"
                  className="hover:text-white transition-colors"
                >
                  Dining Menu
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/signup"
                  className="hover:text-white transition-colors"
                >
                  Guest Account
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/login"
                  className="hover:text-white transition-colors"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Contact & Location
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#b48c58] shrink-0 mt-0.5" />
                <span>{HOTEL.location}</span>
              </li>

              {!hasContactDetails && (
                <li>Contact information will be added when available.</li>
              )}

              {HOTEL.contact.phone && (
                <li className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 text-[#b48c58] shrink-0 mt-0.5" />
                  <span>{HOTEL.contact.phone}</span>
                </li>
              )}

              {HOTEL.contact.email && (
                <li className="flex items-start gap-2.5">
                  <Mail className="h-4 w-4 text-[#b48c58] shrink-0 mt-0.5" />
                  <span>{HOTEL.contact.email}</span>
                </li>
              )}

              {HOTEL.contact.address && (
                <li className="flex items-start gap-2.5">
                  <MapPinned className="h-4 w-4 text-[#b48c58] shrink-0 mt-0.5" />
                  <span>{HOTEL.contact.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} {HOTEL.websiteName}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/auth/setup/owner"
              className="hover:text-slate-300 transition-colors"
            >
              Owner Setup
            </Link>
            <Link
              href="/auth/login"
              className="hover:text-slate-300 transition-colors"
            >
              Staff Sign In
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

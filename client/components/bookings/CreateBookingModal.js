"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import bookingApi from "@/services/bookingApi";
import roomApi from "@/services/roomApi";
import { getErrorMessage } from "@/services/api";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { toast } from "sonner";
import { Calendar, User, Phone, Globe, DollarSign, BedDouble, Info, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CreateBookingModal({
  isOpen,
  onClose,
  preselectedRoom = null,
  onBookingSuccess = () => {},
}) {
  const { isAuthenticated, user, staffProfile, guestProfile } = useAuth();

  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    roomId: preselectedRoom?._id || "",
    firstName: guestProfile?.firstName || staffProfile?.firstName || "",
    lastName: guestProfile?.lastName || staffProfile?.lastName || "",
    phone: guestProfile?.phone || staffProfile?.phone || "",
    country: "Ethiopia",
    checkInDate: new Date().toISOString().split("T")[0],
    checkOutDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    numberOfGuests: 1,
    currency: "ETB",
    specialRequests: "",
  });

  const [errors, setErrors] = useState({});

  // Sync preselected room
  useEffect(() => {
    if (preselectedRoom) {
      setFormData((prev) => ({
        ...prev,
        roomId: preselectedRoom._id,
      }));
    } else if (isOpen) {
      // Fetch available rooms
      const fetchRooms = async () => {
        try {
          setLoadingRooms(true);
          const res = await roomApi.getAvailableRooms();
          const rooms = res.data?.data?.rooms || res.data?.data || [];
          setAvailableRooms(rooms);
          if (rooms.length > 0 && !formData.roomId) {
            setFormData((prev) => ({ ...prev, roomId: rooms[0]._id }));
          }
        } catch (err) {
          console.error("Failed to load rooms", err);
        } finally {
          setLoadingRooms(false);
        }
      };
      fetchRooms();
    }
  }, [preselectedRoom, isOpen]);

  // Selected room object
  const activeRoom =
    preselectedRoom ||
    availableRooms.find((r) => r._id === formData.roomId) ||
    null;

  // Calculate nights and total price
  const calculatePricing = () => {
    if (!formData.checkInDate || !formData.checkOutDate || !activeRoom) {
      return { nights: 0, totalPrice: 0 };
    }

    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);

    if (checkOut <= checkIn || isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return { nights: 0, totalPrice: 0 };
    }

    const diffMs = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const totalPrice = nights * (activeRoom.pricePerNight || 0);

    return { nights, totalPrice };
  };

  const { nights, totalPrice } = calculatePricing();

  const validate = () => {
    const errs = {};
    if (!formData.roomId) errs.roomId = "Please select a room";
    if (!formData.firstName.trim()) errs.firstName = "First name is required";
    if (!formData.lastName.trim()) errs.lastName = "Last name is required";
    if (!formData.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (formData.phone.trim().length < 7) {
      errs.phone = "Phone number is too short";
    }

    if (!formData.checkInDate) errs.checkInDate = "Check-in date is required";
    if (!formData.checkOutDate) errs.checkOutDate = "Check-out date is required";

    if (formData.checkInDate && formData.checkOutDate) {
      if (new Date(formData.checkOutDate) <= new Date(formData.checkInDate)) {
        errs.checkOutDate = "Check-out date must be after check-in date";
      }
    }

    if (!formData.numberOfGuests || formData.numberOfGuests < 1) {
      errs.numberOfGuests = "At least 1 guest is required";
    } else if (activeRoom?.capacity && formData.numberOfGuests > activeRoom.capacity) {
      errs.numberOfGuests = `Exceeds room capacity of ${activeRoom.capacity} guests`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);

      const payload = {
        roomId: formData.roomId,
        guest: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim(),
          country: formData.country.trim() || "Ethiopia",
        },
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        numberOfGuests: Number(formData.numberOfGuests),
        currency: formData.currency,
        specialRequests: formData.specialRequests.trim() || undefined,
      };

      const res = await bookingApi.createBooking(payload);
      toast.success(res.data?.message || "Booking created successfully!");
      onBookingSuccess(res.data?.data);
      onClose();
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={preselectedRoom ? `Book Room ${preselectedRoom.roomNumber}` : "New Reservation"}
      description="Reserve your stay with real-time availability and automatic price calculation"
      maxWidth="2xl"
    >
      {!isAuthenticated ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#8c6838] flex items-center justify-center mx-auto">
            <Info className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            Sign In Required to Book
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Please log in or create a guest account to secure your room reservation and view your booking records.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link href="/auth/login">
              <Button size="sm" variant="outline">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" variant="gold">
                Create Guest Account
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Room Selector if not preselected */}
          {!preselectedRoom && (
            <Select
              label="Select Room"
              id="roomId"
              name="roomId"
              required
              value={formData.roomId}
              onChange={(e) => {
                setFormData({ ...formData, roomId: e.target.value });
                if (errors.roomId) setErrors({ ...errors, roomId: null });
              }}
              options={availableRooms.map((r) => ({
                value: r._id,
                label: `Room ${r.roomNumber} (${r.type.toUpperCase()}) — ${r.pricePerNight} ETB/night (Max ${r.capacity} guests)`,
              }))}
              error={errors.roomId}
              leftIcon={<BedDouble className="h-4 w-4" />}
            />
          )}

          {/* Guest Information Section */}
          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Guest Contact Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="First Name"
                id="firstName"
                name="firstName"
                required
                placeholder="e.g. Dawit"
                value={formData.firstName}
                onChange={(e) => {
                  setFormData({ ...formData, firstName: e.target.value });
                  if (errors.firstName) setErrors({ ...errors, firstName: null });
                }}
                error={errors.firstName}
                leftIcon={<User className="h-4 w-4" />}
              />

              <Input
                label="Last Name"
                id="lastName"
                name="lastName"
                required
                placeholder="e.g. Haile"
                value={formData.lastName}
                onChange={(e) => {
                  setFormData({ ...formData, lastName: e.target.value });
                  if (errors.lastName) setErrors({ ...errors, lastName: null });
                }}
                error={errors.lastName}
                leftIcon={<User className="h-4 w-4" />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3">
              <Input
                label="Phone Number"
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="e.g. +251 911 234567"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: null });
                }}
                error={errors.phone}
                leftIcon={<Phone className="h-4 w-4" />}
              />

              <Input
                label="Country / Origin"
                id="country"
                name="country"
                placeholder="e.g. Ethiopia"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                leftIcon={<Globe className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Stay Dates & Capacity */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Stay Schedule & Guests
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Check-In Date"
                id="checkInDate"
                name="checkInDate"
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
                value={formData.checkInDate}
                onChange={(e) => {
                  setFormData({ ...formData, checkInDate: e.target.value });
                  if (errors.checkInDate) setErrors({ ...errors, checkInDate: null });
                }}
                error={errors.checkInDate}
                leftIcon={<Calendar className="h-4 w-4" />}
              />

              <Input
                label="Check-Out Date"
                id="checkOutDate"
                name="checkOutDate"
                type="date"
                required
                min={formData.checkInDate || new Date().toISOString().split("T")[0]}
                value={formData.checkOutDate}
                onChange={(e) => {
                  setFormData({ ...formData, checkOutDate: e.target.value });
                  if (errors.checkOutDate) setErrors({ ...errors, checkOutDate: null });
                }}
                error={errors.checkOutDate}
                leftIcon={<Calendar className="h-4 w-4" />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3">
              <Input
                label={`Number of Guests (Max ${activeRoom?.capacity || 2})`}
                id="numberOfGuests"
                name="numberOfGuests"
                type="number"
                min="1"
                max={activeRoom?.capacity || 20}
                required
                value={formData.numberOfGuests}
                onChange={(e) => {
                  setFormData({ ...formData, numberOfGuests: Number(e.target.value) });
                  if (errors.numberOfGuests) setErrors({ ...errors, numberOfGuests: null });
                }}
                error={errors.numberOfGuests}
                leftIcon={<User className="h-4 w-4" />}
              />

              <Select
                label="Currency"
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                options={[
                  { value: "ETB", label: "ETB (Ethiopian Birr)" },
                  { value: "USD", label: "USD (US Dollars)" },
                ]}
                leftIcon={<DollarSign className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <Input
              label="Special Requests (Optional)"
              id="specialRequests"
              name="specialRequests"
              placeholder="e.g. Quiet room, high floor, airport pickup assistance"
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
            />
          </div>

          {/* Pricing Summary Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">
                Estimated Duration: <strong className="text-slate-800">{nights} night{nights !== 1 ? "s" : ""}</strong>
              </p>
              <p className="text-[11px] text-slate-400">
                Rate: {activeRoom?.pricePerNight || 0} {formData.currency} / night
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Total Price
              </span>
              <p className="text-lg font-bold text-[#8c6838]">
                {totalPrice.toLocaleString()} {formData.currency}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              isLoading={submitting}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Confirm Reservation
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

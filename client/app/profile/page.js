"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import staffApi from "@/services/staffApi";
import guestApi from "@/services/guestApi";
import userApi from "@/services/userApi";
import { getErrorMessage } from "@/services/api";
import { toast } from "sonner";
import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  Save,
  User,
  CheckCircle2
} from "lucide-react";

export default function ProfilePage() {
  const { user, role, staffProfile, refreshUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (staffProfile) {
      setFormData({
        firstName: staffProfile.firstName || "",
        lastName: staffProfile.lastName || "",
        phone: staffProfile.phone || "",
      });
    } else if (user?.role === "owner" || user?.role === "manager" || user?.role === "receptionist") {
      // Try loading fresh staff profile
      staffApi
        .getMyStaffProfile()
        .then((res) => {
          const s = res.data?.data;
          if (s) {
            setFormData({
              firstName: s.firstName || "",
              lastName: s.lastName || "",
              phone: s.phone || "",
            });
          }
        })
        .catch(() => {});
    }
  }, [staffProfile, user]);

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = "First name is required";
    if (!formData.lastName.trim()) errs.lastName = "Last name is required";
    if (!formData.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (formData.phone.trim().length < 7) {
      errs.phone = "Please enter a valid phone number";
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      if (role === "owner" || role === "manager" || role === "receptionist") {
        await staffApi.updateMyStaffProfile({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim(),
        });
        toast.success("Staff profile updated successfully.");
      }
      await refreshUser();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const isStaff = role === "owner" || role === "manager" || role === "receptionist";

  return (
    <ProtectedRoute>
      <AppShell
        title="Profile & Account Settings"
        subtitle="Manage your personal details, staff profile, and credentials"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {/* User Account Overview Card */}
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
                  {formData.firstName
                    ? formData.firstName.charAt(0).toUpperCase()
                    : user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {formData.firstName
                      ? `${formData.firstName} ${formData.lastName}`
                      : user?.email?.split("@")[0]}
                  </h2>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge status={role} size="sm" />
                    <span className="text-[11px] text-slate-400">
                      ID: {user?._id || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Staff / Guest Profile Information Form */}
          {isStaff && (
            <Card>
              <CardHeader>
                <CardTitle subtitle="Your official name and phone on hotel management records">
                  Staff Profile Information
                </CardTitle>
              </CardHeader>

              <form onSubmit={handleProfileSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    id="firstName"
                    name="firstName"
                    required
                    placeholder="e.g. Abebe"
                    value={formData.firstName}
                    onChange={(e) => {
                      setFormData({ ...formData, firstName: e.target.value });
                      if (formErrors.firstName) setFormErrors({ ...formErrors, firstName: null });
                    }}
                    error={formErrors.firstName}
                    leftIcon={<User className="h-4 w-4" />}
                  />

                  <Input
                    label="Last Name"
                    id="lastName"
                    name="lastName"
                    required
                    placeholder="e.g. Bekele"
                    value={formData.lastName}
                    onChange={(e) => {
                      setFormData({ ...formData, lastName: e.target.value });
                      if (formErrors.lastName) setFormErrors({ ...formErrors, lastName: null });
                    }}
                    error={formErrors.lastName}
                    leftIcon={<User className="h-4 w-4" />}
                  />
                </div>

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
                    if (formErrors.phone) setFormErrors({ ...formErrors, phone: null });
                  }}
                  error={formErrors.phone}
                  leftIcon={<Phone className="h-4 w-4" />}
                  helperText="Primary contact number for hotel staff communications."
                />

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={saving}
                    leftIcon={<Save className="h-4 w-4" />}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Account Security Card */}
          <Card>
            <CardHeader>
              <CardTitle subtitle="Authentication security & session details">
                Account Security & Role Details
              </CardTitle>
            </CardHeader>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span>Account Role</span>
                <span className="font-bold text-slate-900 capitalize">{role}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span>Authentication Method</span>
                <span className="font-semibold text-slate-800">JWT + HttpOnly Cookie</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span>Verification State</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                </span>
              </div>
            </div>
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

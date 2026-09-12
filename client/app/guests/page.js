"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import guestApi from "@/services/guestApi";
import { getErrorMessage } from "@/services/api";
import { toast } from "sonner";
import {
  Users,
  Search,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Pencil,
  Eye,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  FileText
} from "lucide-react";

export default function GuestsPage() {
  const { role } = useAuth();

  const [guests, setGuests] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // View Modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);

  // Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    nationality: "Ethiopian",
    address: "",
    idType: "national_id",
    idNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const query = {
        page,
        limit: 15,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (search.trim()) {
        query.search = search.trim();
      }

      const res = await guestApi.getAllGuests(query);
      const data = res.data?.data;
      setGuests(data?.guests || []);
      setMeta(data?.meta || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchGuests();
  };

  const openViewModal = (guest) => {
    setSelectedGuest(guest);
    setViewModalOpen(true);
  };

  const openEditModal = (guest) => {
    setSelectedGuest(guest);
    setEditFormData({
      firstName: guest.firstName || "",
      lastName: guest.lastName || "",
      phone: guest.phone || "",
      nationality: guest.nationality || "Ethiopian",
      address: guest.address || "",
      idType: guest.idType || "national_id",
      idNumber: guest.idNumber || "",
      emergencyContactName: guest.emergencyContactName || "",
      emergencyContactPhone: guest.emergencyContactPhone || "",
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGuest) return;

    try {
      setIsUpdating(true);
      await guestApi.updateGuest(selectedGuest._id, editFormData);
      toast.success("Guest details updated successfully.");
      setEditModalOpen(false);
      fetchGuests();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["owner", "manager"]}>
      <AppShell
        title="Guest Directory & Profiles"
        subtitle="Manage registered hotel guests, verification documents, and contact records"
      >
        <div className="space-y-6">
          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-card">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c6838]">
                Customer Records
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Registered Hotel Guests
              </h2>
            </div>

            <form onSubmit={handleSearchSubmit} className="max-w-xs w-full">
              <Input
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </form>
          </div>

          {/* Table Card */}
          <Card padding="none" className="overflow-hidden">
            {loading ? (
              <div className="p-6">
                <table className="w-full">
                  <tbody>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <TableRowSkeleton key={i} columns={6} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : guests.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-3.5 px-5">Guest Name</th>
                        <th className="py-3.5 px-5">Phone</th>
                        <th className="py-3.5 px-5">Nationality</th>
                        <th className="py-3.5 px-5">Total Stays</th>
                        <th className="py-3.5 px-5">Registered Date</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {guests.map((g) => (
                        <tr key={g._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                                {g.firstName?.charAt(0) || "G"}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">
                                  {g.firstName} {g.lastName}
                                </p>
                                <p className="text-[11px] text-slate-400 truncate max-w-[160px]">
                                  {g.address || "Address on file"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5 font-semibold text-slate-700">
                            {g.phone}
                          </td>
                          <td className="py-4 px-5 text-slate-600">
                            {g.nationality || "Ethiopian"}
                          </td>
                          <td className="py-4 px-5 font-bold text-[#8c6838]">
                            {g.totalBookings || 0} Bookings
                          </td>
                          <td className="py-4 px-5 text-slate-500">
                            {g.createdAt
                              ? new Date(g.createdAt).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openViewModal(g)}
                                title="View profile details"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditModal(g)}
                                className="text-slate-600 hover:text-slate-900"
                                title="Edit guest"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="p-8">
                <EmptyState
                  icon={<Users className="h-6 w-6" />}
                  title="No guest profiles found"
                  description="Guest records will appear here as guests make bookings or register accounts."
                />
              </div>
            )}
          </Card>

          {/* Pagination */}
          {meta.totalPages > 1 && !search && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-slate-500">
                Page {meta.page} of {meta.totalPages} ({meta.total} guests total)
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

        {/* ===================================================
            VIEW GUEST MODAL
        =================================================== */}
        <Modal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={`Guest: ${selectedGuest?.firstName} ${selectedGuest?.lastName}`}
          description="Complete guest profile information and identification data"
          maxWidth="md"
        >
          {selectedGuest && (
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Phone Number</span>
                <span className="font-bold text-slate-900">{selectedGuest.phone}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Nationality</span>
                <span className="font-semibold text-slate-800">{selectedGuest.nationality || "Ethiopian"}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Address</span>
                <span className="font-semibold text-slate-800">{selectedGuest.address || "—"}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">ID Document Type</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {selectedGuest.idType?.replace(/_/g, " ") || "National ID"}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">ID Document Number</span>
                <span className="font-bold text-slate-900">{selectedGuest.idNumber || "Not recorded"}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Emergency Contact</span>
                <span className="font-semibold text-slate-800">
                  {selectedGuest.emergencyContactName || "—"} ({selectedGuest.emergencyContactPhone || "—"})
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500">Total Hotel Bookings</span>
                <span className="font-bold text-[#8c6838] text-sm">{selectedGuest.totalBookings || 0}</span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => setViewModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* ===================================================
            EDIT GUEST MODAL
        =================================================== */}
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`Edit Guest: ${selectedGuest?.firstName} ${selectedGuest?.lastName}`}
          description="Update guest address, ID documents, or emergency contacts"
          maxWidth="lg"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="First Name"
                id="firstName"
                required
                value={editFormData.firstName}
                onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
              />

              <Input
                label="Last Name"
                id="lastName"
                required
                value={editFormData.lastName}
                onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Phone"
                id="phone"
                required
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />

              <Input
                label="Nationality"
                id="nationality"
                value={editFormData.nationality}
                onChange={(e) => setEditFormData({ ...editFormData, nationality: e.target.value })}
              />
            </div>

            <Input
              label="Address"
              id="address"
              value={editFormData.address}
              onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Select
                label="ID Document Type"
                id="idType"
                value={editFormData.idType}
                onChange={(e) => setEditFormData({ ...editFormData, idType: e.target.value })}
                options={[
                  { value: "national_id", label: "National ID" },
                  { value: "passport", label: "Passport" },
                  { value: "driving_license", label: "Driving License" },
                  { value: "other", label: "Other Document" },
                ]}
              />

              <Input
                label="ID Document Number"
                id="idNumber"
                value={editFormData.idNumber}
                onChange={(e) => setEditFormData({ ...editFormData, idNumber: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Emergency Contact Name"
                id="emergencyContactName"
                value={editFormData.emergencyContactName}
                onChange={(e) => setEditFormData({ ...editFormData, emergencyContactName: e.target.value })}
              />

              <Input
                label="Emergency Contact Phone"
                id="emergencyContactPhone"
                value={editFormData.emergencyContactPhone}
                onChange={(e) => setEditFormData({ ...editFormData, emergencyContactPhone: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isUpdating}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      </AppShell>
    </ProtectedRoute>
  );
}

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
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import { CardSkeleton, TableRowSkeleton } from "@/components/ui/Skeleton";
import roomApi from "@/services/roomApi";
import { getErrorMessage } from "@/services/api";
import { toast } from "sonner";
import {
  BedDouble,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  PowerOff,
  Users,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check
} from "lucide-react";

export default function ManageRoomsPage() {
  const { role } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Create / Edit Modal State
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    roomNumber: "",
    type: "single",
    floor: 1,
    capacity: 2,
    pricePerNight: 1000,
    status: "available",
    amenities: "WiFi, Smart TV, Air Conditioning",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Status Quick Update Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusTargetRoom, setStatusTargetRoom] = useState(null);
  const [newStatus, setNewStatus] = useState("available");
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Delete / Deactivate Confirm State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'delete'|'deactivate', room }
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      if (search.trim()) {
        const res = await roomApi.searchRooms(search.trim());
        const data = res.data?.data || [];
        setRooms(data);
        setMeta({ page: 1, totalPages: 1, total: data.length });
      } else {
        const query = {
          page,
          limit: 12,
          sortBy: "roomNumber",
          sortOrder: "asc",
        };
        const res = await roomApi.getRooms(query);
        const data = res.data?.data;
        let fetched = data?.rooms || [];

        if (statusFilter !== "all") {
          fetched = fetched.filter((r) => r.status === statusFilter);
        }

        setRooms(fetched);
        setMeta(data?.meta || { page: 1, totalPages: 1, total: fetched.length });
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [page, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRooms();
  };

  // Open Create Modal
  const openCreateModal = () => {
    setIsEditing(false);
    setEditingRoomId(null);
    setFormData({
      roomNumber: "",
      type: "single",
      floor: 1,
      capacity: 2,
      pricePerNight: 1000,
      status: "available",
      amenities: "WiFi, Smart TV, Air Conditioning",
      description: "",
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (room) => {
    setIsEditing(true);
    setEditingRoomId(room._id);
    setFormData({
      roomNumber: room.roomNumber || "",
      type: room.type || "single",
      floor: room.floor ?? 1,
      capacity: room.capacity ?? 2,
      pricePerNight: room.pricePerNight ?? 1000,
      status: room.status || "available",
      amenities: Array.isArray(room.amenities) ? room.amenities.join(", ") : "",
      description: room.description || "",
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.roomNumber.trim()) errs.roomNumber = "Room number is required";
    if (!formData.type) errs.type = "Type is required";
    if (formData.floor === "" || Number(formData.floor) < 0) errs.floor = "Floor cannot be negative";
    if (formData.capacity === "" || Number(formData.capacity) < 1) errs.capacity = "Capacity must be at least 1";
    if (formData.pricePerNight === "" || Number(formData.pricePerNight) <= 0) errs.pricePerNight = "Price must be greater than 0";

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const amenitiesArray = formData.amenities
        ? formData.amenities
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean)
        : [];

      const payload = {
        roomNumber: formData.roomNumber.trim(),
        type: formData.type,
        floor: Number(formData.floor),
        capacity: Number(formData.capacity),
        pricePerNight: Number(formData.pricePerNight),
        status: formData.status,
        amenities: amenitiesArray,
        description: formData.description.trim() || undefined,
      };

      if (isEditing) {
        await roomApi.updateRoom(editingRoomId, payload);
        toast.success("Room updated successfully.");
      } else {
        await roomApi.createRoom(payload);
        toast.success("Room created successfully.");
      }

      setFormModalOpen(false);
      fetchRooms();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Status update modal
  const openStatusModal = (room) => {
    setStatusTargetRoom(room);
    setNewStatus(room.status);
    setStatusModalOpen(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusTargetRoom) return;

    try {
      setStatusUpdating(true);
      await roomApi.updateRoomStatus(statusTargetRoom._id, newStatus);
      toast.success("Room status updated.");
      setStatusModalOpen(false);
      fetchRooms();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setStatusUpdating(false);
    }
  };

  // Confirm Actions
  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    try {
      setConfirmLoading(true);
      if (confirmAction.type === "delete") {
        await roomApi.deleteRoom(confirmAction.room._id);
        toast.success("Room deleted successfully.");
      } else if (confirmAction.type === "deactivate") {
        await roomApi.deactivateRoom(confirmAction.room._id);
        toast.success("Room deactivated.");
      }
      setConfirmOpen(false);
      fetchRooms();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setConfirmLoading(false);
    }
  };

  const canCreate = role === "owner";
  const canEdit = role === "owner" || role === "manager";
  const canDelete = role === "owner";

  return (
    <ProtectedRoute allowedRoles={["owner", "manager", "receptionist"]}>
      <AppShell
        title="Room Inventory Management"
        subtitle="Maintain room specifications, housekeeping statuses, and pricing"
      >
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-card">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c6838]">
                Inventory Control
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Hotel Rooms Directory
              </h2>
            </div>

            {canCreate && (
              <Button
                variant="gold"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={openCreateModal}
              >
                Add New Room
              </Button>
            )}
          </div>

          {/* Filter Tabs & Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {["all", "available", "occupied", "cleaning", "maintenance", "inactive"].map((st) => (
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
                  {st}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch} className="max-w-xs w-full">
              <Input
                placeholder="Search rooms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </form>
          </div>

          {/* Rooms Table Card */}
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
            ) : rooms.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-3.5 px-5">Room #</th>
                        <th className="py-3.5 px-5">Type</th>
                        <th className="py-3.5 px-5">Floor</th>
                        <th className="py-3.5 px-5">Capacity</th>
                        <th className="py-3.5 px-5">Rate / Night</th>
                        <th className="py-3.5 px-5">Status</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {rooms.map((room) => (
                        <tr key={room._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-5 font-bold text-slate-900 text-sm">
                            {room.roomNumber}
                          </td>
                          <td className="py-4 px-5 font-semibold text-slate-700 capitalize">
                            {room.type} Suite
                          </td>
                          <td className="py-4 px-5 text-slate-600">
                            Floor {room.floor}
                          </td>
                          <td className="py-4 px-5 text-slate-600">
                            {room.capacity} Guests
                          </td>
                          <td className="py-4 px-5 font-bold text-slate-900">
                            {room.pricePerNight?.toLocaleString()} ETB
                          </td>
                          <td className="py-4 px-5">
                            <button
                              type="button"
                              onClick={() => openStatusModal(room)}
                              className="cursor-pointer group text-left"
                              title="Click to change status"
                            >
                              <Badge status={room.status} size="sm" />
                            </button>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openStatusModal(room)}
                              >
                                Status
                              </Button>

                              {canEdit && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEditModal(room)}
                                  className="text-slate-600 hover:text-slate-900"
                                  title="Edit room"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              )}

                              {canDelete && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setConfirmAction({ type: "delete", room });
                                    setConfirmOpen(true);
                                  }}
                                  className="text-slate-400 hover:text-rose-600"
                                  title="Delete room"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile / Tablet Responsive Cards */}
                <div className="lg:hidden divide-y divide-slate-100 p-4">
                  {rooms.map((room) => (
                    <div key={room._id} className="py-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-base font-bold text-slate-900">
                            Room {room.roomNumber}
                          </span>
                          <span className="text-xs text-slate-500 block capitalize">
                            {room.type} Suite • Floor {room.floor}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => openStatusModal(room)}
                          className="cursor-pointer"
                        >
                          <Badge status={room.status} size="sm" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Capacity
                          </span>
                          <span>{room.capacity} Guests</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Rate
                          </span>
                          <span className="font-bold text-slate-900">{room.pricePerNight?.toLocaleString()} ETB</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openStatusModal(room)}
                          className="flex-1"
                        >
                          Update Status
                        </Button>
                        {canEdit && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openEditModal(room)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setConfirmAction({ type: "delete", room });
                              setConfirmOpen(true);
                            }}
                            className="text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
                  icon={<BedDouble className="h-6 w-6" />}
                  title="No rooms found"
                  description="Add new rooms to your hotel inventory or reset your filter."
                  actionLabel={canCreate ? "Add Room" : "View All"}
                  onAction={canCreate ? openCreateModal : () => setStatusFilter("all")}
                />
              </div>
            )}
          </Card>

          {/* Pagination */}
          {meta.totalPages > 1 && !search && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-slate-500">
                Page {meta.page} of {meta.totalPages} ({meta.total} rooms total)
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
            CREATE / EDIT ROOM MODAL
        =================================================== */}
        <Modal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          title={isEditing ? `Edit Room ${formData.roomNumber}` : "Create New Room"}
          description="Configure room number, suite type, pricing, and guest capacity"
          maxWidth="lg"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Room Number"
                id="roomNumber"
                required
                placeholder="e.g. 101, 204"
                value={formData.roomNumber}
                onChange={(e) => {
                  setFormData({ ...formData, roomNumber: e.target.value });
                  if (formErrors.roomNumber) setFormErrors({ ...formErrors, roomNumber: null });
                }}
                error={formErrors.roomNumber}
              />

              <Select
                label="Room Type"
                id="type"
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                options={[
                  { value: "single", label: "Single Suite" },
                  { value: "double", label: "Double Deluxe" },
                  { value: "family", label: "Family Executive" },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <Input
                label="Floor Level"
                id="floor"
                type="number"
                min="0"
                required
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                error={formErrors.floor}
              />

              <Input
                label="Guest Capacity"
                id="capacity"
                type="number"
                min="1"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                error={formErrors.capacity}
              />

              <Input
                label="Rate / Night (ETB)"
                id="pricePerNight"
                type="number"
                min="1"
                required
                value={formData.pricePerNight}
                onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                error={formErrors.pricePerNight}
              />
            </div>

            <Select
              label="Initial Status"
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: "available", label: "Available" },
                { value: "occupied", label: "Occupied" },
                { value: "cleaning", label: "Cleaning" },
                { value: "maintenance", label: "Maintenance" },
                { value: "inactive", label: "Inactive" },
              ]}
            />

            <Input
              label="Amenities (Comma separated)"
              id="amenities"
              placeholder="WiFi, TV, Balcony, Minibar"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              helperText="e.g. WiFi, Smart TV, Air Conditioning, City View"
            />

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Room Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe room features, view, and layout..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-sm bg-white rounded-xl border border-slate-200 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                {isEditing ? "Save Changes" : "Create Room"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* ===================================================
            UPDATE ROOM STATUS MODAL
        =================================================== */}
        <Modal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          title={`Update Room ${statusTargetRoom?.roomNumber} Status`}
          description="Select current housekeeping or occupancy condition"
          maxWidth="sm"
        >
          <form onSubmit={handleStatusSubmit} className="space-y-4">
            <Select
              label="Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              options={[
                { value: "available", label: "Available (Ready for guests)" },
                { value: "occupied", label: "Occupied (Guest in room)" },
                { value: "cleaning", label: "Cleaning (Housekeeping underway)" },
                { value: "maintenance", label: "Maintenance (Repairs needed)" },
              ]}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStatusModalOpen(false)}
                disabled={statusUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gold" isLoading={statusUpdating}>
                Update Status
              </Button>
            </div>
          </form>
        </Modal>

        {/* ===================================================
            DELETE / DEACTIVATE CONFIRMATION
        =================================================== */}
        <ConfirmDialog
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirmAction}
          isLoading={confirmLoading}
          title={
            confirmAction?.type === "delete"
              ? `Delete Room ${confirmAction?.room?.roomNumber}?`
              : `Deactivate Room ${confirmAction?.room?.roomNumber}?`
          }
          description={
            confirmAction?.type === "delete"
              ? "This action cannot be undone. Room specifications will be permanently removed."
              : "Room will be marked inactive and removed from public booking catalogs."
          }
          confirmText={confirmAction?.type === "delete" ? "Delete Room" : "Deactivate"}
        />
      </AppShell>
    </ProtectedRoute>
  );
}

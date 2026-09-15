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
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import menuApi from "@/services/menuApi";
import { getErrorMessage } from "@/services/api";
import { toast } from "sonner";
import { scrollToFirstError } from "@/utils/scrollToFormError";
import {
  Utensils,
  Plus,
  Search,
  Pencil,
  Trash2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

export default function ManageMenuPage() {
  const { role } = useAuth();

  const [menus, setMenus] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Form Modal (Add / Edit)
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 150,
    category: "breakfast",
    preparationTime: 15,
    isAvailable: true,
  });
  const [formErrors, setFormErrors] = useState({});

  // Delete Confirm
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetItem, setTargetItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const query = {
        page,
        limit: 15,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (categoryFilter !== "all") {
        query.category = categoryFilter;
      }

      if (search.trim()) {
        query.search = search.trim();
      }

      const res = await menuApi.getMenu(query);
      const data = res.data?.data;
      setMenus(data?.menus || []);
      setMeta(data?.meta || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [page, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMenu();
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      price: 150,
      category: "breakfast",
      preparationTime: 15,
      isAvailable: true,
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  const openEditModal = (item) => {
    setIsEditing(true);
    setEditingId(item._id);
    setFormData({
      name: item.name || "",
      description: item.description || "",
      price: item.price ?? 150,
      category: item.category || "breakfast",
      preparationTime: item.preparationTime ?? 15,
      isAvailable: item.isAvailable ?? true,
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Item name is required";
    if (formData.price === "" || Number(formData.price) < 0)
      errs.price = "Price cannot be negative";
    if (formData.preparationTime === "" || Number(formData.preparationTime) < 0)
      errs.preparationTime = "Prep time must be positive";

    setFormErrors(errs);
    if (Object.keys(errs).length > 0) {
      scrollToFirstError(errs);
      return false;
    }
    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: Number(formData.price),
        category: formData.category,
        preparationTime: Number(formData.preparationTime),
        isAvailable: formData.isAvailable,
      };

      if (isEditing) {
        await menuApi.updateMenu(editingId, payload);
        toast.success("Menu item updated.");
      } else {
        await menuApi.createMenu(payload);
        toast.success("Menu item created.");
      }

      setFormModalOpen(false);
      fetchMenu();
    } catch (err) {
      toast.error(getErrorMessage(err));
      scrollToFirstError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!targetItem) return;
    try {
      setIsDeleting(true);
      await menuApi.deleteMenu(targetItem._id);
      toast.success("Menu item deleted.");
      setDeleteConfirmOpen(false);
      fetchMenu();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwner = role === "owner";

  return (
    <ProtectedRoute allowedRoles={["owner", "manager"]}>
      <AppShell
        title="Restaurant & Dining Menu Management"
        subtitle="Maintain culinary offerings, dish descriptions, categories, and pricing"
      >
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-card">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c6838]">
                Culinary Operations
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Menu Items & Beverages
              </h2>
            </div>

            <Button
              variant="gold"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={openCreateModal}
            >
              Add Menu Item
            </Button>
          </div>

          {/* Categories Filter & Search */}
          <div className="flex flex-col items-start gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card">
            {" "}
            {/* Category Filters */}{" "}
            <div className="w-full overflow-hidden">
              {" "}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none overscroll-x-contain">
                {" "}
                {[
                  "all",
                  "breakfast",
                  "lunch",
                  "dinner",
                  "meat",
                  "beverage",
                  "alcohol",
                  "hot_drink",
                  "cake",
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategoryFilter(cat);
                      setPage(1);
                    }}
                    className={`shrink-0 whitespace-nowrap px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all cursor-pointer ${categoryFilter === cat ? "bg-slate-900 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    {" "}
                    {cat.replace("_", " ")}{" "}
                  </button>
                ))}{" "}
              </div>{" "}
            </div>{" "}
            {/* Search */}{" "}
            <form
              onSubmit={handleSearchSubmit}
              className="w-full md:max-w-xs"
            >
              {" "}
              <Input
                placeholder="Search dishes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />{" "}
            </form>{" "}
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
            ) : menus.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3.5 px-5">Dish / Item Name</th>
                      <th className="py-3.5 px-5">Category</th>
                      <th className="py-3.5 px-5">Price (ETB)</th>
                      <th className="py-3.5 px-5">Prep Time</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {menus.map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="py-4 px-5">
                          <p className="font-bold text-slate-900">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">
                            {item.description || "—"}
                          </p>
                        </td>
                        <td className="py-4 px-5">
                          <Badge status={item.category} size="sm" />
                        </td>
                        <td className="py-4 px-5 font-bold text-slate-900">
                          {item.price?.toLocaleString()} ETB
                        </td>
                        <td className="py-4 px-5 text-slate-600">
                          {item.preparationTime || 15} mins
                        </td>
                        <td className="py-4 px-5">
                          <span
                            className={`inline-flex items-center font-semibold text-[11px] px-2 py-0.5 rounded-md ${
                              item.isAvailable
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {item.isAvailable ? "Available" : "Unavailable"}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditModal(item)}
                              className="text-slate-600 hover:text-slate-900"
                              title="Edit item"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>

                            {isOwner && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setTargetItem(item);
                                  setDeleteConfirmOpen(true);
                                }}
                                className="text-slate-400 hover:text-rose-600"
                                title="Delete item"
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
            ) : (
              <div className="p-8">
                <EmptyState
                  icon={<Utensils className="h-6 w-6" />}
                  title="No menu items found"
                  description="Add new items to provide dining and room service options for guests."
                  actionLabel="Add Menu Item"
                  onAction={openCreateModal}
                />
              </div>
            )}
          </Card>

          {/* Pagination */}
          {meta.totalPages > 1 && !search && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-slate-500">
                Page {meta.page} of {meta.totalPages} ({meta.total} items total)
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

        {/* Create / Edit Modal */}
        <Modal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          title={isEditing ? `Edit: ${formData.name}` : "Add New Menu Item"}
          description="Define menu name, category, price, and kitchen prep duration"
          maxWidth="md"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
            <Input
              label="Item Name"
              id="name"
              required
              placeholder="e.g. Special Tibs, Classic Omelette"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (formErrors.name)
                  setFormErrors({ ...formErrors, name: null });
              }}
              error={formErrors.name}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Select
                label="Category"
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                options={[
                  { value: "breakfast", label: "Breakfast" },
                  { value: "lunch", label: "Lunch" },
                  { value: "dinner", label: "Dinner" },
                  { value: "meat", label: "Meat & Grill" },
                  { value: "beverage", label: "Beverages" },
                  { value: "alcohol", label: "Alcohol" },
                  { value: "hot_drink", label: "Hot Drink" },
                  { value: "cake", label: "Cake" },
                ]}
              />

              <Input
                label="Price (ETB)"
                id="price"
                type="number"
                min="0"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                error={formErrors.price}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Prep Time (Minutes)"
                id="preparationTime"
                type="number"
                min="0"
                value={formData.preparationTime}
                onChange={(e) =>
                  setFormData({ ...formData, preparationTime: e.target.value })
                }
                error={formErrors.preparationTime}
              />

              <Select
                label="Availability"
                id="isAvailable"
                value={formData.isAvailable ? "true" : "false"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isAvailable: e.target.value === "true",
                  })
                }
                options={[
                  { value: "true", label: "Available" },
                  { value: "false", label: "Unavailable / Sold Out" },
                ]}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Ingredients, culinary notes, portion size..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full text-sm bg-white rounded-xl border border-slate-200 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={submitting}>
                {isEditing ? "Save Item" : "Create Item"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={handleDeleteSubmit}
          isLoading={isDeleting}
          title={`Delete ${targetItem?.name}?`}
          description="This action cannot be undone. The dish will be permanently removed from all menus."
          confirmText="Delete Menu Item"
        />
      </AppShell>
    </ProtectedRoute>
  );
}

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
import staffApi from "@/services/staffApi";
import authApi from "@/services/authApi";
import { getErrorMessage } from "@/services/api";
import { toast } from "sonner";
import {
  UserCheck,
  Plus,
  Mail,
  Phone,
  Calendar,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Filter
} from "lucide-react";
import { scrollToFirstError } from "@/utils/scrollToFormError";

export default function StaffPage() {
  const { user, role } = useAuth();

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");

  // Invite Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("receptionist");
  const [inviteErrors, setInviteErrors] = useState({});
  const [isInviting, setIsInviting] = useState(false);
  const [invitedSuccessEmail, setInvitedSuccessEmail] = useState(null);

  // Delete Confirm State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetStaff, setTargetStaff] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const query = {};
      if (roleFilter !== "all") {
        query.role = roleFilter;
      }
      const res = await staffApi.getAllStaff(query);
      setStaffList(res.data?.data?.staff || res.data?.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [roleFilter]);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !/\S+@\S+\.\S+/.test(inviteEmail)) {
      const errs = { inviteEmail: "Please enter a valid email address", email: "Please enter a valid email address" };
      setInviteErrors({ email: "Please enter a valid email address" });
      scrollToFirstError(errs);
      return;
    }

    try {
      setIsInviting(true);
      const res = await authApi.setupStaff({
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      toast.success(res.data?.message || "Staff invitation created and sent.");
      setInvitedSuccessEmail(inviteEmail.trim());
      fetchStaff();
    } catch (err) {
      toast.error(getErrorMessage(err));
      scrollToFirstError(err);
    } finally {
      setIsInviting(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!targetStaff) return;
    try {
      setIsDeleting(true);
      await staffApi.deleteStaff(targetStaff._id);
      toast.success("Staff profile deleted.");
      setDeleteConfirmOpen(false);
      fetchStaff();
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
        title="Staff & Team Directory"
        subtitle="Manage hotel employees, assign operational roles, and send invitations"
      >
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-card">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c6838]">
                Human Resources
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Staff Members & Roles
              </h2>
            </div>

            {isOwner && (
              <Button
                variant="gold"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => {
                  setInviteEmail("");
                  setInviteRole("receptionist");
                  setInviteErrors({});
                  setInvitedSuccessEmail(null);
                  setInviteModalOpen(true);
                }}
              >
                Invite Staff Member
              </Button>
            )}
          </div>

          {/* Role Filter Tabs */}
          <div className="flex min-h-[66px] items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white px-5">
            <span className="mr-2 flex shrink-0 items-center gap-1.5 text-sm font-medium leading-none text-slate-400">
              <Filter className="h-4 w-4 shrink-0" />
              <span>Role:</span>
            </span>

            {[
              { value: "all", label: "All" },
              { value: "owner", label: "Owner" },
              { value: "manager", label: "Manager" },
              { value: "receptionist", label: "Receptionist" },
            ].map(({ value, label }) => {
              const isActive = roleFilter === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRoleFilter(value)}
                  aria-pressed={isActive}
                  className={`flex shrink-0 items-center justify-center rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Staff Table Card */}
          <Card padding="none" className="overflow-hidden">
            {loading ? (
              <div className="p-6">
                <table className="w-full">
                  <tbody>
                    {[1, 2, 3, 4].map((i) => (
                      <TableRowSkeleton key={i} columns={5} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : staffList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3.5 px-5">Staff Member</th>
                      <th className="py-3.5 px-5">Assigned Role</th>
                      <th className="py-3.5 px-5">Contact Phone</th>
                      <th className="py-3.5 px-5">Joined Date</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {staffList.map((st) => (
                      <tr
                        key={st._id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                              {st.firstName?.charAt(0) || "S"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                {st.firstName} {st.lastName}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                User ID: {st.user?._id || st.user}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <Badge status={st.role} size="sm" />
                        </td>
                        <td className="py-4 px-5 font-medium text-slate-700">
                          {st.phone}
                        </td>
                        <td className="py-4 px-5 text-slate-500">
                          {st.joinedAt
                            ? new Date(st.joinedAt).toLocaleDateString()
                            : "On file"}
                        </td>
                        <td className="py-4 px-5 text-right">
                          {isOwner && st.role !== "owner" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-slate-400 hover:text-rose-600"
                              onClick={() => {
                                setTargetStaff(st);
                                setDeleteConfirmOpen(true);
                              }}
                              title="Delete staff record"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8">
                <EmptyState
                  icon={<UserCheck className="h-6 w-6" />}
                  title="No staff records found"
                  description="Invite employees to assign management and receptionist permissions."
                  actionLabel={isOwner ? "Invite Staff" : undefined}
                  onAction={
                    isOwner ? () => setInviteModalOpen(true) : undefined
                  }
                />
              </div>
            )}
          </Card>
        </div>

        {/* ===================================================
            INVITE STAFF MODAL
        =================================================== */}
        <Modal
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          title="Invite New Staff Member"
          description="Send an email invitation containing an activation token"
          maxWidth="md"
        >
          {!invitedSuccessEmail ? (
            <form
              onSubmit={handleInviteSubmit}
              className="space-y-4"
              noValidate
            >
              <Input
                label="Staff Email Address"
                id="inviteEmail"
                type="email"
                required
                placeholder="colleague@hotel.com"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  if (inviteErrors.email) setInviteErrors({});
                }}
                error={inviteErrors.email}
                leftIcon={<Mail className="h-4 w-4" />}
              />

              <Select
                label="Assign Operational Role"
                id="inviteRole"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                options={[
                  {
                    value: "manager",
                    label: "Manager (Full operations, rooms, bookings, guests)",
                  },
                  {
                    value: "receptionist",
                    label: "Receptionist (Bookings, room statuses, check-ins)",
                  },
                ]}
              />

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
                <p>
                  An activation link will be dispatched. The employee will
                  verify their token, set their secure password, and complete
                  their profile.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInviteModalOpen(false)}
                  disabled={isInviting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  isLoading={isInviting}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Send Invitation
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Invitation Sent
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                An invitation email has been sent to{" "}
                <strong className="text-slate-800">
                  {invitedSuccessEmail}
                </strong>
                .
              </p>
              <Button
                variant="primary"
                onClick={() => setInviteModalOpen(false)}
                className="w-full mt-2"
              >
                Done
              </Button>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={handleDeleteStaff}
          isLoading={isDeleting}
          title={`Remove Staff Member ${targetStaff?.firstName} ${targetStaff?.lastName || ""}?`}
          description="This action will delete the staff profile record from the hotel directory."
          confirmText="Delete Staff"
        />
      </AppShell>
    </ProtectedRoute>
  );
}

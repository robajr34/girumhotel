"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import userApi from "@/services/userApi";
import { getErrorMessage } from "@/services/api";
import { toast } from "sonner";
import {
  ShieldCheck,
  Search,
  Ban,
  Trash2,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Eye,
  Copy,
  Link as LinkIcon
} from "lucide-react";

export default function UsersPage() {
  const { role, user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Confirmation state (block or delete)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [confirmType, setConfirmType] = useState(null); // 'block' | 'delete'
  const [confirmLoading, setConfirmLoading] = useState(false);

  // User Details state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userApi.getAllUsers();
      let data = res.data?.data.users || res.data?.data || [];
      if (search.trim()) {
        const s = search.toLowerCase().trim();
        data = data.filter(
          (u) =>
            u.email?.toLowerCase().includes(s) ||
            u.role?.toLowerCase().includes(s),
        );
      }

      setUsers(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleConfirmAction = async () => {
    if (!targetUser || !confirmType) return;

    try {
      setConfirmLoading(true);
      if (confirmType === "block") {
        await userApi.blockUser(targetUser._id);
        toast.success(`User ${targetUser.email} blacklisted successfully.`);
      } else if (confirmType === "delete") {
        await userApi.deleteUser(targetUser._id);
        toast.success(`User ${targetUser.email} deleted.`);
      }
      setConfirmOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["owner", "manager"]}>
      <AppShell
        title="System Users & Security"
        subtitle="Manage authentication credentials, blacklist blocked accounts, and review logins"
      >
        <div className="space-y-6">
          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-card">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c6838]">
                Account Administration
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Registered System Accounts
              </h2>
            </div>

            <form onSubmit={handleSearchSubmit} className="max-w-xs w-full">
              <Input
                placeholder="Search by email or role..."
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
            ) : users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3.5 px-5">User Account</th>
                      <th className="py-3.5 px-5">System Role</th>
                      <th className="py-3.5 px-5">Account Status</th>
                      <th className="py-3.5 px-5">Email Verified</th>
                      <th className="py-3.5 px-5">Invitation</th>
                      <th className="py-3.5 px-5">Last Login</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {users.map((u) => {
                      const isSelf = u._id === currentUser?._id;
                      return (
                        <tr
                          key={u._id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">
                                  {u.email}{" "}
                                  {isSelf && (
                                    <span className="text-[10px] text-[#8c6838] font-normal">
                                      (You)
                                    </span>
                                  )}
                                </p>
                                <p className="text-[11px] text-slate-400 font-mono">
                                  ID: {u._id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <Badge status={u.role} size="sm" />
                          </td>
                          <td className="py-4 px-5">
                            {u.isBlackListed ? (
                              <Badge status="cancelled" size="sm">
                                Blocked
                              </Badge>
                            ) : u.requireSetup ? (
                              <Badge status="pending" size="sm">
                                Setup Pending
                              </Badge>
                            ) : (
                              <Badge status="available" size="sm">
                                Active
                              </Badge>
                            )}
                          </td>
                          <td className="py-4 px-5 text-slate-600">
                            {u.isVerified ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                                <CheckCircle2 className="h-3.5 w-3.5" />{" "}
                                Verified
                              </span>
                            ) : (
                              <span className="text-slate-400">Unverified</span>
                            )}
                          </td>
                          <td className="py-4 px-5">
                            {(() => {
                              if (!u.requireSetup)
                                return (
                                  <span className="text-slate-400">
                                    Completed
                                  </span>
                                );
                              if (!u.activeInvitationUrl)
                                return (
                                  <span className="text-slate-400">None</span>
                                );
                              const isExpired =
                                u.invitationTokenExpiresAt &&
                                new Date(u.invitationTokenExpiresAt) <
                                  new Date();
                              return isExpired ? (
                                <Badge status="cancelled" size="sm">
                                  Expired
                                </Badge>
                              ) : (
                                <Badge status="available" size="sm">
                                  Active
                                </Badge>
                              );
                            })()}
                          </td>
                          <td className="py-4 px-5 text-slate-500">
                            {u.lastLoginAt
                              ? new Date(u.lastLoginAt).toLocaleString()
                              : "Never logged in"}
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                onClick={() => {
                                  setSelectedUser(u);
                                  setDetailsOpen(true);
                                }}
                                title="View user details"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>

                              {!isSelf && u.role !== "owner" && (
                                <>
                                  {!u.isBlackListed && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                      onClick={() => {
                                        setTargetUser(u);
                                        setConfirmType("block");
                                        setConfirmOpen(true);
                                      }}
                                      title="Block / Blacklist user"
                                    >
                                      <Ban className="h-3.5 w-3.5" />
                                    </Button>
                                  )}

                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-slate-400 hover:text-rose-600"
                                    onClick={() => {
                                      setTargetUser(u);
                                      setConfirmType("delete");
                                      setConfirmOpen(true);
                                    }}
                                    title="Delete user account"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8">
                <EmptyState
                  icon={<ShieldCheck className="h-6 w-6" />}
                  title="No users found"
                  description="User accounts will appear here as users sign up or get invited."
                />
              </div>
            )}
          </Card>
        </div>

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirmAction}
          isLoading={confirmLoading}
          title={
            confirmType === "block"
              ? `Blacklist User ${targetUser?.email}?`
              : `Delete User ${targetUser?.email}?`
          }
          description={
            confirmType === "block"
              ? "This user will be barred from logging in and all active refresh tokens will be revoked."
              : "This user account will be permanently removed from the system."
          }
          confirmText={confirmType === "block" ? "Blacklist User" : "Delete User"}
        />

        {/* User Details Modal */}
        <Modal
          isOpen={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          title="User Account Details"
          description="Review user information and staff invitations."
          maxWidth="md"
        >
          {selectedUser && (
            <div className="space-y-6">
              {/* General Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Overview</h4>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm grid grid-cols-2 gap-y-4 gap-x-2">
                  <div>
                    <span className="block text-xs text-slate-500 mb-1">Email</span>
                    <span className="font-semibold text-slate-900">{selectedUser.email}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 mb-1">Role</span>
                    <Badge status={selectedUser.role} size="sm" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 mb-1">Account Status</span>
                    {selectedUser.isBlackListed ? (
                      <span className="text-rose-600 font-semibold">Blocked</span>
                    ) : (
                      <span className="text-emerald-600 font-semibold">Active</span>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 mb-1">Verification</span>
                    {selectedUser.isVerified ? (
                      <span className="text-emerald-600 font-semibold">Verified</span>
                    ) : (
                      <span className="text-slate-400">Unverified</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs text-slate-500 mb-1">Last Login</span>
                    <span className="text-slate-700">
                      {selectedUser.lastLoginAt
                        ? new Date(selectedUser.lastLoginAt).toLocaleString()
                        : "Never logged in"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Invitation Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Staff Invitation</h4>
                <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm">
                  {(() => {
                    if (!selectedUser.requireSetup) {
                      return <p className="text-slate-500">Setup completed. No active invitation.</p>;
                    }

                    if (!selectedUser.activeInvitationUrl) {
                      return <p className="text-slate-500">No active staff invitation found.</p>;
                    }

                    const isExpired =
                      selectedUser.invitationTokenExpiresAt &&
                      new Date(selectedUser.invitationTokenExpiresAt) < new Date();

                    if (isExpired) {
                      return (
                        <div className="space-y-2">
                          <Badge status="cancelled" size="sm">Expired</Badge>
                          <p className="text-xs text-slate-500 mt-2">
                            This invitation expired on {new Date(selectedUser.invitationTokenExpiresAt).toLocaleString()}.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge status="available" size="sm">Active</Badge>
                          {selectedUser.invitationTokenExpiresAt && (
                            <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Expires: {new Date(selectedUser.invitationTokenExpiresAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="bg-slate-50 rounded-lg border border-slate-100 p-3 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                            <LinkIcon className="h-3.5 w-3.5" /> Invitation Link
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-white border border-slate-200 rounded text-xs text-slate-600 px-2 py-1.5 truncate">
                              {selectedUser.activeInvitationUrl}
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="shrink-0"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(selectedUser.activeInvitationUrl);
                                  toast.success("Invitation link copied.");
                                } catch (err) {
                                  toast.error("Failed to copy link.");
                                }
                              }}
                              leftIcon={<Copy className="h-3.5 w-3.5" />}
                            >
                              Copy
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </div>
        </Modal>
      </AppShell>
    </ProtectedRoute>
  );
}

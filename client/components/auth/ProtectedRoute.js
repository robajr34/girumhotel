"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ShieldAlert, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = "/auth/login",
}) {
  const { isAuthenticated, isLoading, user, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, redirectTo, router]);

  // Loading state (skeleton/spinner)
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-slate-800" />
        <p className="text-xs text-slate-500 font-medium tracking-wide">
          Verifying access...
        </p>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Role authorization check
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Access Restricted
        </h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          You do not have permission to view this section. Your account role ({role}) has insufficient privileges.
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            Go Back
          </Button>
          <Button
            size="sm"
            onClick={() => router.push(role === "guest" ? "/rooms" : "/dashboard")}
          >
            Go to {role === "guest" ? "Rooms" : "Dashboard"}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

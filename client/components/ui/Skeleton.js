import React from "react";

export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-card animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28 rounded-lg" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-8 w-36 rounded-lg" />
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-4/5 rounded" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr className="border-b border-slate-100 animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-3.5 px-4">
          <Skeleton className="h-4 w-full max-w-[120px] rounded" />
        </td>
      ))}
    </tr>
  );
}

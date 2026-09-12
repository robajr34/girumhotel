import React from "react";
import Button from "./Button";
import { FolderOpen } from "lucide-react";

export default function EmptyState({
  icon = null,
  title = "No data found",
  description = "There are no records to display at this moment.",
  actionLabel = null,
  onAction = null,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-white border border-dashed border-slate-200 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3.5">
        {icon || <FolderOpen className="h-6 w-6" />}
      </div>
      <h4 className="text-sm font-semibold text-slate-800 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} variant="outline">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

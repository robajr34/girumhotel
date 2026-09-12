"use client";

import React from "react";
import Modal from "./Modal";
import Button from "./Button";
import { AlertTriangle, Info } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description = "Are you sure you want to proceed with this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      maxWidth="sm"
      showClose={!isLoading}
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
            variant === "danger"
              ? "bg-rose-50 text-rose-600"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          {variant === "danger" ? (
            <AlertTriangle className="h-6 w-6" />
          ) : (
            <Info className="h-6 w-6" />
          )}
        </div>

        <h3 className="text-base font-semibold text-slate-900 mb-1.5">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-xs mb-6">
          {description}
        </p>

        <div className="flex items-center gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={onClose}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === "danger" ? "danger" : "primary"}
            isLoading={isLoading}
            onClick={onConfirm}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

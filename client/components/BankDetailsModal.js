"use client";

import React, { useState } from "react";
import { HOTEL } from "@/constants/hotel";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { toast } from "sonner";
import { Landmark, Copy, Check, CreditCard, ShieldCheck } from "lucide-react";

/**
 * Reusable BankDetailsModal Component
 * Displays official hotel bank account details sourced directly from HOTEL constants.
 * Includes one-click copy to clipboard with toast notification and icon state feedback.
 */
export default function BankDetailsModal({ isOpen, onClose }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const bankDetails = Array.isArray(HOTEL?.bankDetails) ? HOTEL.bankDetails : [];

  const handleCopy = async (accountNumber, bankName, index) => {
    if (!accountNumber) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(accountNumber);
      } else {
        // Fallback for non-secure contexts
        const textarea = document.createElement("textarea");
        textarea.value = accountNumber;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopiedIndex(index);
      toast.success(`${bankName} account number copied!`);

      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy account number:", err);
      toast.error("Unable to copy to clipboard.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bank Details"
      description={`Official bank account records for ${HOTEL.websiteName || HOTEL.name} direct transfers`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Verification banner */}
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/60 text-xs text-amber-900">
          <ShieldCheck className="h-4 w-4 text-[#8c6838] shrink-0" />
          <span>
            Please verify payment details before completing wire transfers or mobile bank payments.
          </span>
        </div>

        {/* Bank Account List */}
        {bankDetails.length > 0 ? (
          <div className="space-y-3.5 pt-1">
            {bankDetails.map((bank, index) => {
              const isCopied = copiedIndex === index;

              return (
                <div
                  key={`${bank.bankName}-${bank.accountNumber || index}`}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all space-y-3"
                >
                  {/* Bank Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                        <Landmark className="h-4 w-4 text-[#8c6838]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Bank
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">
                          {bank.bankName || "Commercial Bank"}
                        </h4>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                      Verified
                    </span>
                  </div>

                  {/* Account Name & Number Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Account Name
                      </span>
                      <p className="font-semibold text-slate-800">
                        {bank.accountName || HOTEL.name}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Account Number
                      </span>
                      <div className="flex items-center justify-between gap-2 p-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                        <span className="font-mono font-bold text-slate-900 tracking-wider">
                          {bank.accountNumber || "—"}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(bank.accountNumber, bank.bankName, index)
                          }
                          disabled={!bank.accountNumber}
                          aria-label={`Copy account number for ${bank.bankName}`}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] font-semibold ${
                            isCopied
                              ? "bg-emerald-100 text-emerald-800"
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/70"
                          }`}
                          title="Copy account number"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <CreditCard className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500">
              No bank account records currently configured.
            </p>
          </div>
        )}

        {/* Modal Action Bar */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <Button type="button" variant="primary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

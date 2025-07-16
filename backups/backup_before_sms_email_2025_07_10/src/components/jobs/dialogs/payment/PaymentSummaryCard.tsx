
import React from "react";
import { roundToCurrency } from "@/lib/utils";

interface PaymentSummaryCardProps {
  invoice: {
    invoice_number: string;
    total: number;
    amount_paid?: number;
  };
  remainingBalance: number;
}

export const PaymentSummaryCard = ({ invoice, remainingBalance }: PaymentSummaryCardProps) => {
  return (
    <div className="bg-blue-50 p-3 rounded-lg">
      <p className="text-sm text-blue-800">
        <strong>Invoice:</strong> #{invoice.invoice_number}
      </p>
      <p className="text-sm text-blue-800">
        <strong>Total:</strong> ${roundToCurrency(invoice.total).toFixed(2)}
      </p>
      <p className="text-sm text-blue-800">
        <strong>Paid:</strong> ${roundToCurrency(invoice.amount_paid ?? 0).toFixed(2)}
      </p>
      <p className="text-sm font-semibold text-blue-800">
        <strong>Remaining:</strong> ${remainingBalance.toFixed(2)}
      </p>
    </div>
  );
};

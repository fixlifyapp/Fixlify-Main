
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface PaymentFormProps {
  amount: string;
  setAmount: (amount: string) => void;
  method: string;
  setMethod: (method: string) => void;
  reference: string;
  setReference: (reference: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  remainingBalance: number;
  maxPayment: number;
  isFormDisabled: boolean;
}

export const PaymentForm = ({
  amount,
  setAmount,
  method,
  setMethod,
  reference,
  setReference,
  notes,
  setNotes,
  remainingBalance,
  maxPayment,
  isFormDisabled
}: PaymentFormProps) => {
  const handleAmountChange = (value: string) => {
    // Only allow positive numbers with up to 2 decimal places
    const sanitized = value.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) return; // Don't allow multiple decimal points
    if (parts[1] && parts[1].length > 2) return; // Don't allow more than 2 decimal places
    setAmount(sanitized);
  };

  const setPercentage = (percentage: number) => {
    if (maxPayment > 0) {
      const calculatedAmount = (maxPayment * percentage / 100).toFixed(2);
      setAmount(calculatedAmount);
    }
  };

  const setFullAmount = () => {
    if (maxPayment > 0) {
      setAmount(maxPayment.toFixed(2));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="amount">Payment Amount</Label>
        <div className="space-y-2">
          <Input
            id="amount"
            type="text"
            placeholder="0.00"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            disabled={isFormDisabled}
            className="text-lg font-medium"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPercentage(25)}
              disabled={isFormDisabled}
            >
              25%
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPercentage(50)}
              disabled={isFormDisabled}
            >
              50%
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={setFullAmount}
              disabled={isFormDisabled}
            >
              Full
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Maximum: {formatCurrency(maxPayment)}
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="method">Payment Method</Label>
        <Select value={method} onValueChange={setMethod} disabled={isFormDisabled}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="credit-card">Credit Card</SelectItem>
            <SelectItem value="e-transfer">E-Transfer</SelectItem>
            <SelectItem value="cheque">Cheque</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="reference">Reference Number (Optional)</Label>
        <Input
          id="reference"
          placeholder="Check number, transaction ID, etc."
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          disabled={isFormDisabled}
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Additional payment details..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isFormDisabled}
          rows={3}
        />
      </div>
    </div>
  );
};

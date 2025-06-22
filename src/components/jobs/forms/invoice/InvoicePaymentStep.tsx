import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Send, CreditCard, Receipt } from "lucide-react";
import { toast } from "sonner";

interface InvoicePaymentStepProps {
  invoice: any;
  onPayment: (amount: number, method: string, reference?: string, notes?: string) => void;
  onSendInvoice: () => void;
}

export const InvoicePaymentStep = ({ invoice, onPayment, onSendInvoice }: InvoicePaymentStepProps) => {
  const [paymentAmount, setPaymentAmount] = useState(invoice.total || 0);
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleRecordPayment = async () => {
    if (paymentAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setIsProcessingPayment(true);
    try {
      await onPayment(paymentAmount, paymentMethod, paymentReference, paymentNotes);
    } catch (error) {
      toast.error("Failed to record payment");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSendInvoice = () => {
    toast.success("Invoice sent to customer");
    onSendInvoice();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Payment Recording */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Record Payment
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="paymentAmount">Payment Amount</Label>
              <Input
                id="paymentAmount"
                type="number"
                min="0"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Invoice total: ${invoice.total?.toFixed(2)}
              </p>
            </div>

            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit-card">Credit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="e-transfer">E-Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="paymentReference">Reference</Label>
              <Input
                id="paymentReference"
                placeholder="Transaction ID, check number, etc."
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="paymentNotes">Notes</Label>
              <Textarea
                id="paymentNotes"
                placeholder="Payment notes..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleRecordPayment}
              disabled={isProcessingPayment || paymentAmount <= 0}
              className="w-full gap-2"
            >
              <CreditCard className="h-4 w-4" />
              {isProcessingPayment ? "Recording..." : "Record Payment"}
            </Button>
          </CardContent>
        </Card>

        {/* Send Invoice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Invoice
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Send the invoice to your customer via email or other communication methods.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Receipt className="h-4 w-4" />
                <span>Invoice #{invoice.invoiceNumber}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Total: ${invoice.total?.toFixed(2)}
              </div>
            </div>

            <Button
              onClick={handleSendInvoice}
              variant="outline"
              className="w-full gap-2"
            >
              <Send className="h-4 w-4" />
              Send to Customer
            </Button>

            <div className="text-xs text-muted-foreground">
              <p>This will mark the invoice as sent and notify the customer.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Summary</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">${invoice.total?.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Amount</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                ${paymentAmount.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Payment Amount</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                ${Math.max(0, (invoice.total || 0) - paymentAmount).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Remaining Balance</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

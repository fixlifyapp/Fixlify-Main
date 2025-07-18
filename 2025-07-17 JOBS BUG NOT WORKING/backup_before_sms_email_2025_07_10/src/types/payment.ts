
export type PaymentMethod = "cash" | "credit-card" | "e-transfer" | "cheque";
export type PaymentStatus = "paid" | "refunded" | "disputed";

export interface Payment {
  id: string;
  date: string;
  clientId?: string;
  clientName?: string;
  jobId?: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  notes?: string;
  technicianId?: string;
  technicianName?: string;
  invoice_id?: string;
  created_at?: string;
}

export interface PaymentInput {
  amount: number;
  method: PaymentMethod;
  date: string;
  notes?: string;
  status?: PaymentStatus;
}

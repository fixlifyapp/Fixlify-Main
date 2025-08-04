// DEPRECATED: This file is kept for backward compatibility
// Please use imports from '@/types' or '@/types/core/payment' instead

// Re-export everything from the new location
export * from './core/payment';

// Keep the old type names for backward compatibility
export type PaymentMethod = "cash" | "credit-card" | "e-transfer" | "cheque";
export type PaymentStatus = "paid" | "refunded" | "disputed";

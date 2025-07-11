
import { z } from "zod";

// Define the schema for an invoice line item
export const invoiceLineItemSchema = z.object({
  description: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1").default(1),
  unitPrice: z.number().min(0, "Price must be at least 0").default(0),
  ourPrice: z.number().min(0, "Our price must be at least 0").default(0),
  taxable: z.boolean().default(true)
});

// Define the schema for the entire invoice form
export const invoiceFormSchema = z.object({
  invoiceNumber: z.string().optional(),
  issueDate: z.string().optional(),
  dueDate: z.string().optional(),
  items: z.array(invoiceLineItemSchema).min(1, "At least one item is required"),
  notes: z.string().optional()
});

// TypeScript type derived from the Zod schema
export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

// For components that need partial form values (like during initialization)
export type PartialInvoiceFormValues = Partial<InvoiceFormValues>;

// Interface for the InvoiceForm component props
export interface InvoiceFormProps {
  type: "invoice" | "estimate";
  onSubmit: (data: InvoiceFormValues) => void;
  onCancel: () => void;
  defaultInvoiceNumber?: string;
  companyInfo: {
    name: string;
    logo: string;
    address: string;
    phone: string;
    email: string;
    legalText: string;
  };
  clientInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  showWarrantyUpsell?: boolean;
  previousItems?: any[];
}

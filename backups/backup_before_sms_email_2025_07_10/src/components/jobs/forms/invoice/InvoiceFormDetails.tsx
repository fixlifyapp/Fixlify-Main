
import { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InvoiceFormValues } from "./schema";
import { InvoiceLineItems } from "./InvoiceLineItems";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface InvoiceFormDetailsProps {
  form: UseFormReturn<InvoiceFormValues>;
  type: "invoice" | "estimate";
  onCancel: () => void;
  previousItems?: any[];
  calculateTotal: () => number;
}

export const InvoiceFormDetails = ({
  form,
  type,
  onCancel,
  previousItems,
  calculateTotal,
}: InvoiceFormDetailsProps) => {
  // Handle form submission correctly
  const onSubmit = form.handleSubmit((data) => {
    console.log("Form submitted:", data);
    // The actual submission logic is handled by the parent component
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="invoiceNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{type === "invoice" ? "Invoice" : "Estimate"} #</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <InvoiceLineItems 
          form={form} 
          previousItems={previousItems}
        />

        <div className="text-right text-xl font-semibold">
          <span>Total: ${calculateTotal().toFixed(2)}</span>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Payment terms, delivery information, etc."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Send {type === "invoice" ? "Invoice" : "Estimate"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

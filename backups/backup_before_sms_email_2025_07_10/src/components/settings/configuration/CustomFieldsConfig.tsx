
import { ConfigItemCard } from "./ConfigItemCard";
import { useCustomFields } from "@/hooks/useConfigItems";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import * as z from "zod";

const customFieldSchema = z.object({
  name: z.string().min(1, "Name is required"),
  field_type: z.string().min(1, "Field type is required"),
  entity_type: z.string().min(1, "Entity type is required"),
  placeholder: z.string().optional(),
  default_value: z.string().optional(),
  required: z.boolean().optional(),
  selectOptions: z.string().optional()
});

export function CustomFieldsConfig() {
  const {
    items: customFields,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    canManage,
    refreshItems
  } = useCustomFields();

  const handleAddField = async (values: any) => {
    // Process options for select fields
    if (values.field_type === 'select' && values.selectOptions) {
      const options = values.selectOptions
        .split('\n')
        .map((opt: string) => opt.trim())
        .filter((opt: string) => opt.length > 0);
      
      values.options = { options };
    }
    
    // Remove the temporary selectOptions field
    delete values.selectOptions;
    
    return await addItem(values);
  };

  const handleUpdateField = async (id: string, values: any) => {
    // Process options for select fields
    if (values.field_type === 'select' && values.selectOptions) {
      const options = values.selectOptions
        .split('\n')
        .map((opt: string) => opt.trim())
        .filter((opt: string) => opt.length > 0);
      
      values.options = { options };
    }
    
    // Remove the temporary selectOptions field
    delete values.selectOptions;
    
    return await updateItem(id, values);
  };

  const renderItemDialogFields = ({ form, fieldType }: { form: any; fieldType?: string }) => (
    <>
      <FormField
        control={form.control}
        name="field_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Field Type</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select field type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="textarea">Textarea</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="select">Select (Dropdown)</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="entity_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Apply To</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="job">Job</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="estimate">Estimate</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="placeholder"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Placeholder Text</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter placeholder text" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="default_value"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Default Value</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter default value" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {fieldType === 'select' && (
        <FormField
          control={form.control}
          name="selectOptions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Options (one per line)</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      <FormField
        control={form.control}
        name="required"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Field is required
              </FormLabel>
            </div>
          </FormItem>
        )}
      />
    </>
  );

  const getInitialValues = (item?: any) => {
    if (!item) {
      return { field_type: "text", entity_type: "job", required: false };
    }
    
    // Prepare selectOptions for editing
    let selectOptions = '';
    if (item.field_type === 'select' && item.options?.options) {
      selectOptions = item.options.options.join('\n');
    }
    
    return {
      ...item,
      selectOptions
    };
  };

  return (
    <ConfigItemCard
      title="Custom Fields"
      description="Create custom fields for jobs and other entities"
      items={customFields}
      isLoading={isLoading}
      canManage={canManage}
      onAdd={handleAddField}
      onUpdate={handleUpdateField}
      onDelete={deleteItem}
      refreshItems={refreshItems}
      renderCustomColumns={(field) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {field.field_type}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {field.entity_type}
            </Badge>
          </div>
          {field.required && (
            <span className="text-xs text-red-600">Required</span>
          )}
        </div>
      )}
      schema={customFieldSchema}
      itemDialogFields={renderItemDialogFields}
      getInitialValues={getInitialValues}
    />
  );
}

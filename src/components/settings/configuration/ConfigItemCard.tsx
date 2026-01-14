
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { ConfigItemDialog } from "./ConfigItemDialog";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { toast } from "sonner";

interface ConfigItemCardProps {
  title: string;
  description: string;
  items: any[];
  isLoading: boolean;
  canManage: boolean;
  onAdd: (item: any) => Promise<any>;
  onUpdate: (id: string, item: any) => Promise<any>;
  onDelete: (id: string) => Promise<boolean>;
  refreshItems: () => void;
  renderCustomColumns?: (item: any) => React.ReactNode;
  schema?: any;
  itemDialogFields?: React.ReactNode | ((props: { form: any; fieldType?: string }) => React.ReactNode);
  getInitialValues?: (item?: any) => any;
}

export function ConfigItemCard({
  title,
  description,
  items,
  isLoading,
  canManage,
  onAdd,
  onUpdate,
  onDelete,
  refreshItems,
  renderCustomColumns,
  schema,
  itemDialogFields,
  getInitialValues
}: ConfigItemCardProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingItem, setDeletingItem] = useState<any>(null);

  const handleAdd = async (values: any) => {
    try {
      const result = await onAdd(values);
      // Only close dialog if add actually succeeded
      // (onAdd returns null on error, already shows error toast)
      if (result) {
        setIsAddDialogOpen(false);
        refreshItems();
        // Note: success toast is already shown by useConfigItems hook
      }
    } catch (error) {
      console.error(`Error adding ${title.toLowerCase()}:`, error);
      toast.error(`Failed to add ${title.toLowerCase()}`);
    }
  };

  const handleUpdate = async (values: any) => {
    if (!editingItem) return;

    try {
      const result = await onUpdate(editingItem.id, values);
      // Only close dialog and show success if update actually succeeded
      // (onUpdate returns null on error, already shows error toast)
      if (result) {
        setEditingItem(null);
        refreshItems();
        // Note: success toast is already shown by useConfigItems hook
      }
    } catch (error) {
      console.error(`Error updating ${title.toLowerCase()}:`, error);
      toast.error(`Failed to update ${title.toLowerCase()}`);
    }
  };

  const handleDelete = async (): Promise<boolean> => {
    if (!deletingItem) return false;
    
    try {
      const success = await onDelete(deletingItem.id);
      if (success) {
        setDeletingItem(null);
        refreshItems();
        toast.success(`${title.slice(0, -1)} deleted successfully`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting ${title.toLowerCase()}:`, error);
      toast.error(`Failed to delete ${title.toLowerCase()}`);
      return false;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading {title.toLowerCase()}...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            {canManage && (
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add {title.slice(0, -1)}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No {title.toLowerCase()} configured yet.
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      {item.is_default && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    )}
                    {renderCustomColumns && (
                      <div className="mt-2">
                        {renderCustomColumns(item)}
                      </div>
                    )}
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingItem(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingItem(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfigItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title={`Add ${title.slice(0, -1)}`}
        onSubmit={handleAdd}
        customFields={itemDialogFields}
        schema={schema}
        initialValues={getInitialValues ? getInitialValues() : {}}
      />

      <ConfigItemDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        title={`Edit ${title.slice(0, -1)}`}
        onSubmit={handleUpdate}
        customFields={itemDialogFields}
        schema={schema}
        initialValues={getInitialValues ? getInitialValues(editingItem) : editingItem || {}}
      />

      <ConfirmDeleteDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={handleDelete}
        title={`Delete ${title.slice(0, -1)}`}
        description={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        itemName={deletingItem?.name || ""}
        itemType={title.slice(0, -1).toLowerCase()}
      />
    </>
  );
}

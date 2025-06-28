
import { useModal } from "@/components/ui/modal-provider";
import { Button } from "@/components/ui/button";

export function ModalExample() {
  const { openModal } = useModal();

  const handleOpenClientModal = () => {
    openModal("clientSelection", {
      onSave: (client: string) => {
        console.log("Selected client:", client);
      }
    });
  };

  const handleOpenDeleteConfirmation = () => {
    openModal("deleteConfirm", {
      title: "Delete Item",
      description: "Are you sure you want to delete this item? This action cannot be undone.",
      onConfirm: () => {
        console.log("Item deleted");
      }
    });
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-semibold">Modal System Examples</h2>
      <div className="space-x-4">
        <Button onClick={handleOpenClientModal}>
          Select Client
        </Button>
        <Button variant="destructive" onClick={handleOpenDeleteConfirmation}>
          Delete Item
        </Button>
      </div>
    </div>
  );
}


import { useState } from "react";
import { toast } from "sonner";

export const useEstimateBuilderActions = (hasLineItems: boolean) => {
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [isCustomLineItemDialogOpen, setIsCustomLineItemDialogOpen] = useState(false);
  const [isProductEditDialogOpen, setIsProductEditDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);

  const openProductSearch = () => setIsProductSearchOpen(true);
  const openCustomLineItemDialog = () => setIsCustomLineItemDialogOpen(true);
  const openProductEditDialog = () => setIsProductEditDialogOpen(true);

  const handleSendEstimate = () => {
    if (!hasLineItems) {
      toast.error("Please add at least one item to the estimate before sending it to the client");
      return;
    }
    setIsSendDialogOpen(true);
  };

  return {
    isProductSearchOpen,
    setIsProductSearchOpen,
    isCustomLineItemDialogOpen,
    setIsCustomLineItemDialogOpen,
    isProductEditDialogOpen,
    setIsProductEditDialogOpen,
    isSendDialogOpen,
    setIsSendDialogOpen,
    openProductSearch,
    openCustomLineItemDialog,
    openProductEditDialog,
    handleSendEstimate
  };
};

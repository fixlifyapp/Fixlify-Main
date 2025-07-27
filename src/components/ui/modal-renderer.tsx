import React from "react";
import { useModal, ModalType } from "./modal-provider";
import { ConvertToInvoiceDialog } from "@/components/jobs/estimates/dialogs/ConvertToInvoiceDialog";
import { JobDetailsEditDialog } from "@/components/jobs/dialogs/JobDetailsEditDialog";
import { MessageDialog } from "@/components/messages/MessageDialog";

export const ModalRenderer = () => {
  const { modals } = useModal();

  return (
    <>
      {modals.map((modal) => {
        const { type, props: modalProps, id } = modal;
        const commonProps = {
          key: id,
          open: true,
          onOpenChange: (open: boolean) => {
            if (!open) {
              modalProps.onClose?.();
            }
          }
        };

        switch (type) {
          case "editJobDetails":
            return <JobDetailsEditDialog 
              {...commonProps} 
              initialDescription={modalProps.initialDescription || ""}
              jobId={modalProps.jobId || ""}
              onSave={modalProps.onSave || (() => {})}
              {...modalProps}
            />;
            
          case "convertToInvoice":
            return <ConvertToInvoiceDialog 
              {...commonProps} 
              onConfirm={modalProps.onConfirm || (() => {})}
              {...modalProps}
            />;
            
          case "messageClient":
            return <MessageDialog
              open={commonProps.open}
              onOpenChange={commonProps.onOpenChange}
              client={{
                name: modalProps.clientName || "Client",
                phone: modalProps.clientPhone,
                id: modalProps.clientId
              }}
            />;

          default:
            // For now, return null for unimplemented modals
            console.warn(`Modal type "${type}" is not implemented yet`);
            return null;
        }
      })}
    </>
  );
};

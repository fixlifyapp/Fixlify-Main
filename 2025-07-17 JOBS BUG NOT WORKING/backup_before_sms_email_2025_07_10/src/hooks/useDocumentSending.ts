// Minimal placeholder - SMS/Email functionality removed
export const useDocumentSending = () => {
  return {
    sendDocument: async () => ({ success: false, error: "Not implemented" }),
    isProcessing: false
  };
};

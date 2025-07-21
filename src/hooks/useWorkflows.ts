// Stub for workflows hook

export const useWorkflows = () => {
  return {
    workflows: [],
    loading: false,
    isLoading: false,
    createWorkflow: async (data?: any) => ({ success: true, data: { id: 'workflow-123' } }),
    updateWorkflow: async (data?: any) => ({ success: true }),
    deleteWorkflow: async (id?: any) => ({ success: true }),
    toggleWorkflow: async (id?: any) => ({ success: true }),
    executeWorkflow: async (id?: any) => ({ success: true }),
    isCreating: false,
    isUpdating: false,
    refetch: () => Promise.resolve()
  };
};

export const useWorkflow = (id?: any) => {
  return {
    workflow: null,
    loading: false,
    isLoading: false,
    updateWorkflow: async (id?: any, data?: any) => ({ success: true }),
    refetch: () => Promise.resolve()
  };
};
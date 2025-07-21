// Stub for config items hook

export const useConfigItems = () => {
  return {
    items: [],
    loading: false,
    updateItem: async () => ({ success: true }),
    refetch: () => Promise.resolve()
  };
};

export const useJobStatuses = () => {
  return {
    jobStatuses: [],
    items: [],
    loading: false,
    isLoading: false,
    createJobStatus: async () => ({ success: true }),
    updateJobStatus: async () => ({ success: true }),
    deleteJobStatus: async () => ({ success: true }),
    addItem: async () => ({ success: true }),
    updateItem: async () => ({ success: true }),
    deleteItem: async () => ({ success: true }),
    refetch: () => Promise.resolve()
  };
};

export const useJobTypes = () => {
  return {
    jobTypes: [],
    items: [],
    loading: false,
    isLoading: false,
    createJobType: async () => ({ success: true }),
    updateJobType: async () => ({ success: true }),
    deleteJobType: async () => ({ success: true }),
    addItem: async () => ({ success: true }),
    updateItem: async () => ({ success: true }),
    deleteItem: async () => ({ success: true }),
    canManage: true,
    refreshItems: () => Promise.resolve(),
    refetch: () => Promise.resolve()
  };
};

export const useTags = () => {
  return {
    tags: [],
    items: [],
    loading: false,
    isLoading: false,
    createTag: async () => ({ success: true }),
    updateTag: async () => ({ success: true }),
    deleteTag: async () => ({ success: true }),
    addItem: async () => ({ success: true }),
    updateItem: async () => ({ success: true }),
    deleteItem: async () => ({ success: true }),
    canManage: true,
    refreshItems: () => Promise.resolve(),
    refetch: () => Promise.resolve()
  };
};

export const useLeadSources = () => {
  return {
    leadSources: [],
    items: [],
    loading: false,
    isLoading: false,
    createLeadSource: async () => ({ success: true }),
    updateLeadSource: async () => ({ success: true }),
    deleteLeadSource: async () => ({ success: true }),
    addItem: async () => ({ success: true }),
    updateItem: async () => ({ success: true }),
    deleteItem: async () => ({ success: true }),
    canManage: true,
    refreshItems: () => Promise.resolve(),
    refetch: () => Promise.resolve()
  };
};

export const useCustomFields = () => {
  return {
    customFields: [],
    items: [],
    loading: false,
    isLoading: false,
    createCustomField: async () => ({ success: true }),
    updateCustomField: async () => ({ success: true }),
    deleteCustomField: async () => ({ success: true }),
    addItem: async () => ({ success: true }),
    updateItem: async () => ({ success: true }),
    deleteItem: async () => ({ success: true }),
    canManage: true,
    refreshItems: () => Promise.resolve(),
    refetch: () => Promise.resolve()
  };
};
// Stub for company email settings hook

export const useCompanyEmailSettings = () => {
  return {
    settings: null,
    loading: false,
    updateSettings: async () => ({ success: true }),
    refetch: () => Promise.resolve()
  };
};
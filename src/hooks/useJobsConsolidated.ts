// Stub for jobs consolidated hook

export const useJobsConsolidated = (clientId?: any) => {
  return {
    jobs: [],
    loading: false,
    isLoading: false,
    createJob: async (data?: any) => ({ success: true, data: { id: 'job-123' } }),
    updateJob: async (data?: any) => ({ success: true }),
    deleteJob: async (id?: any) => ({ success: true }),
    refreshJobs: () => Promise.resolve(),
    canCreate: true,
    canEdit: true,
    canDelete: true,
    refetch: () => Promise.resolve()
  };
};
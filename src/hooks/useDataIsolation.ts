// Stub for data isolation hook

export const useDataIsolation = () => {
  return {
    isolatedData: [],
    loading: false,
    fetchData: async () => ({ success: true, data: [] }),
    refetch: () => Promise.resolve(),
    withUserFilter: () => ({ success: true }),
    prepareInsert: (data: any) => data
  };
};
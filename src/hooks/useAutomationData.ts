// Stub for automation data hook

export const useAutomationData = () => {
  return {
    workflows: [],
    templates: [],
    executions: [],
    loading: false,
    refetch: () => Promise.resolve()
  };
};
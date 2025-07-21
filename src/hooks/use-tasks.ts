// Stub for tasks hook

export const useTasks = () => {
  return {
    tasks: [],
    data: [],
    loading: false,
    isLoading: false,
    createTask: async () => ({ success: true, data: { id: 'task-123' } }),
    updateTask: async () => ({ success: true }),
    deleteTask: async () => ({ success: true }),
    refetch: () => Promise.resolve()
  };
};

export const useJobTasks = (jobId?: string) => {
  return {
    data: [],
    isLoading: false,
    refetch: () => Promise.resolve()
  };
};

export const useCreateTask = () => {
  return {
    mutate: async (data?: any) => ({ success: true, data: { id: 'task-123' } }),
    mutateAsync: async (data?: any) => ({ success: true, data: { id: 'task-123' } }),
    isLoading: false,
    isPending: false
  };
};

export const useUpdateTask = () => {
  return {
    mutate: async (data?: any) => ({ success: true }),
    mutateAsync: async (data?: any) => ({ success: true }),
    isLoading: false,
    isPending: false
  };
};

export const useDeleteTask = () => {
  return {
    mutate: async (data?: any) => ({ success: true }),
    mutateAsync: async (data?: any) => ({ success: true }),
    isLoading: false,
    isPending: false
  };
};

export const useOverdueTasks = () => {
  return {
    data: [],
    isLoading: false
  };
};
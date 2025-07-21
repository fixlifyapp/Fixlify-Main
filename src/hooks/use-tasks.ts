// Stub for tasks hook

export const useTasks = () => {
  return {
    tasks: [],
    loading: false,
    createTask: async () => ({ success: true, data: { id: 'task-123' } }),
    updateTask: async () => ({ success: true }),
    deleteTask: async () => ({ success: true })
  };
};

export const useJobTasks = () => {
  return {
    data: [],
    isLoading: false,
    refetch: () => Promise.resolve()
  };
};

export const useCreateTask = () => {
  return {
    mutate: async () => ({ success: true, data: { id: 'task-123' } }),
    isLoading: false
  };
};

export const useUpdateTask = () => {
  return {
    mutate: async () => ({ success: true }),
    isLoading: false
  };
};

export const useDeleteTask = () => {
  return {
    mutate: async () => ({ success: true }),
    isLoading: false
  };
};

export const useOverdueTasks = () => {
  return {
    data: [],
    isLoading: false
  };
};
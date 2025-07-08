
import { useUnifiedRealtime } from "./useUnifiedRealtime";

export const useJobsRealtime = (onJobChange: () => void) => {
  return useUnifiedRealtime({
    tables: ['jobs'],
    onUpdate: onJobChange,
    enabled: true
  });
};

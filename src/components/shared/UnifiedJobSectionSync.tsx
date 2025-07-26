import React, { createContext, useContext, useEffect } from "react";
import { useUnifiedJobData } from "@/hooks/useUnifiedJobData";

interface JobSectionSyncContextType {
  jobTypes: any[];
  tags: any[];
  technicians: any[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const JobSectionSyncContext = createContext<JobSectionSyncContextType | undefined>(undefined);

export const useJobSectionSync = () => {
  const context = useContext(JobSectionSyncContext);
  if (!context) {
    throw new Error("useJobSectionSync must be used within a JobSectionSyncProvider");
  }
  return context;
};

interface JobSectionSyncProviderProps {
  children: React.ReactNode;
}

export const JobSectionSyncProvider = ({ children }: JobSectionSyncProviderProps) => {
  const unifiedData = useUnifiedJobData();

  // Auto-refresh on focus
  useEffect(() => {
    const handleFocus = () => {
      unifiedData.refreshData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [unifiedData.refreshData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      unifiedData.refreshData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [unifiedData.refreshData]);

  return (
    <JobSectionSyncContext.Provider value={unifiedData}>
      {children}
    </JobSectionSyncContext.Provider>
  );
};
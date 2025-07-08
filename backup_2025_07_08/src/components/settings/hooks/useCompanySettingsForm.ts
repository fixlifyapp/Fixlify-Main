import { useState, useEffect } from 'react';
import { useCompanySettings as useBaseCompanySettings } from '@/hooks/useCompanySettings';

export const useCompanySettings = () => {
  const { companySettings, isLoading, updateCompanySettings } = useBaseCompanySettings();
  const [saving, setSaving] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, any>>({});

  // Track changes without saving immediately
  const updateSettings = (updates: Record<string, any>) => {
    setPendingUpdates(prev => ({ ...prev, ...updates }));
  };

  // Save all pending changes
  const saveSettings = async () => {
    if (Object.keys(pendingUpdates).length === 0) return;
    
    setSaving(true);
    try {
      await updateCompanySettings(pendingUpdates);
      setPendingUpdates({});
    } finally {
      setSaving(false);
    }
  };

  // Merge current settings with pending updates
  const settings = {
    ...companySettings,
    ...pendingUpdates
  };

  return {
    settings,
    loading: isLoading,
    saving,
    updateSettings,
    saveSettings,
    hasChanges: Object.keys(pendingUpdates).length > 0
  };
};

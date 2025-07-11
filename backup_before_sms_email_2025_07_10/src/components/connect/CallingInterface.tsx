import React from 'react';
import { UnifiedCallManager } from '@/components/calling/UnifiedCallManager';

// Legacy component - redirects to UnifiedCallManager
export const CallingInterface = () => {
  return <UnifiedCallManager />;
};

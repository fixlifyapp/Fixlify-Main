// Stub implementations for various automation hooks

import { useState } from 'react';

export const useAutomationTrigger = () => {
  return {
    execute: async (triggerId: string, data: any) => {
      console.log('Executing trigger:', triggerId, data);
      return { success: true };
    }
  };
};

export const useAutomationTriggers = () => {
  return {
    triggers: [],
    loading: false,
    error: null
  };
};

export const useOrganizationContext = () => {
  return {
    organization: { id: 'test-org', name: 'Test Organization' },
    loading: false
  };
};

export const useOrganization = () => {
  return {
    organization: { 
      id: 'test-org', 
      name: 'Test Organization',
      business_type: 'General Services'
    },
    loading: false
  };
};

export const useTasks = () => {
  return {
    tasks: [],
    loading: false,
    createTask: async () => ({ success: true }),
    updateTask: async () => ({ success: true }),
    deleteTask: async () => ({ success: true })
  };
};

export const useAutomationData = () => {
  return {
    workflows: [],
    templates: [],
    executions: [],
    loading: false,
    refetch: () => Promise.resolve()
  };
};
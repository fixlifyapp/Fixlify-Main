// Stub for organization hook

export const useOrganization = () => {
  return {
    organization: { 
      id: 'test-org', 
      name: 'Test Organization',
      business_type: 'General Services',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    loading: false
  };
};
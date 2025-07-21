// Stub for portal link hook

export const usePortalLink = () => {
  return {
    generateLink: async (data?: any) => ({ success: true, link: 'https://portal.example.com/test' }),
    copyPortalLink: async (data?: any) => ({ success: true }),
    loading: false,
    isGenerating: false
  };
};
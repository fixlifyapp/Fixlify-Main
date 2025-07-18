// Routing Debug Utility - Add this to your project to debug blank page issues

export const debugRouting = () => {
  console.group('🔍 Routing Debug Information');
  console.log('Current URL:', window.location.href);
  console.log('Pathname:', window.location.pathname);
  console.log('Hash:', window.location.hash);
  console.log('Search:', window.location.search);
  
  // Check if React is loaded
  console.log('React loaded:', typeof window.React !== 'undefined');
  
  // Check for common issues
  if (!document.getElementById('root')) {
    console.error('❌ Root element not found! Check index.html');
  }
  
  // Log any console errors
  window.addEventListener('error', (e) => {
    console.error('❌ Global error:', e.error);
  });
  
  window.addEventListener('unhandledrejection', (e) => {
    console.error('❌ Unhandled promise rejection:', e.reason);
  });
  
  console.groupEnd();
};

// Call this in your App component
debugRouting();

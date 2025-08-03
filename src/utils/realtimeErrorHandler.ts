// Global error handler for Supabase real-time errors
export const setupRealtimeErrorHandler = () => {
  // Override console.error to catch and filter real-time errors
  const originalConsoleError = console.error;
  
  console.error = function(...args: any[]) {
    // Filter out known real-time channel errors
    const errorString = args.join(' ');
    
    if (
      errorString.includes('Realtime channel error') ||
      errorString.includes('Channel error') ||
      errorString.includes('removeChannel') ||
      errorString.includes('postgres_changes') ||
      errorString.includes('CHANNEL_ERROR')
    ) {
      // Log to console.log instead of console.error
      console.log('🔇 Suppressed realtime error:', ...args);
      return;
    }
    
    // For all other errors, use the original console.error
    console.log('🔍 DEBUGGING - Full error details:', ...args);
    originalConsoleError.apply(console, args);
  };
  
  // Handle WebSocket errors
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      if (
        event.message?.includes('WebSocket') ||
        event.message?.includes('realtime') ||
        event.message?.includes('channel')
      ) {
        event.preventDefault();
        console.log('🔇 Suppressed WebSocket error:', event.message);
      }
    });
  }
};

// Call this function to set up error handling
setupRealtimeErrorHandler();

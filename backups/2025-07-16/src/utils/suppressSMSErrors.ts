// Global error suppressor for SMS-related errors
export const suppressSMSErrors = () => {
  // Suppress network errors related to SMS
  window.addEventListener('error', (event) => {
    if (event.message && 
        (event.message.includes('mqppvcrlvsgrsqelglod.t/v1/sms_messages') ||
         event.message.includes('Failed to load resource') && event.message.includes('409'))) {
      event.preventDefault();
      event.stopPropagation();
      console.log('Suppressed SMS network error');
      return false;
    }
  }, true);

  // Suppress unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && 
        (event.reason.toString().includes('sms_messages') ||
         event.reason.toString().includes('409'))) {
      event.preventDefault();
      console.log('Suppressed SMS promise rejection');
      return false;
    }
  });

  // Override fetch to handle 409 errors silently
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      // If it's a 409 error on SMS endpoints, don't throw
      if (response.status === 409 && 
          args[0] && 
          args[0].toString().includes('sms_messages')) {
        console.log('Suppressed 409 error for SMS');
        return response;
      }
      return response;
    } catch (error) {
      // Suppress SMS-related errors
      if (error.message && error.message.includes('sms_messages')) {
        console.log('Suppressed SMS fetch error');
        return new Response(JSON.stringify({ error: 'suppressed' }), { status: 200 });
      }
      throw error;
    }
  };
};

// Call this function when the app starts
suppressSMSErrors();
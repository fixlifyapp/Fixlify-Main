// Test Edge Function Connection
export async function testEdgeFunction() {
  try {
    const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/generate-with-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        prompt: 'Test',
        context: 'Test context',
        mode: 'text'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge function error:', response.status, errorText);
      return { error: errorText, status: response.status };
    }

    const data = await response.json();
    console.log('Edge function response:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Network error:', error);
    return { error: error.message };
  }
}

// Add this to window for easy testing
if (typeof window !== 'undefined') {
  (window as any).testEdgeFunction = testEdgeFunction;
}

import React from 'react';

function DebugApp() {
  const [error, setError] = React.useState<any>(null);
  
  React.useEffect(() => {
    console.log('Debug app mounted');
    
    // Catch any errors
    window.addEventListener('error', (e) => {
      console.error('Window error:', e);
      setError(e.error);
    });
    
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled rejection:', e);
      setError(e.reason);
    });
  }, []);
  
  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1 style={{ color: 'green' }}>✅ React is Working!</h1>
      <p>Time: {new Date().toLocaleTimeString()}</p>
      <p>URL: {window.location.href}</p>
      
      <h2>Environment Variables:</h2>
      <pre style={{ background: '#f0f0f0', padding: '10px' }}>
        VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL || 'NOT SET'}
      </pre>
      <pre style={{ background: '#f0f0f0', padding: '10px' }}>
        VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET (hidden)' : 'NOT SET'}
      </pre>
      
      {error && (
        <div style={{ background: 'red', color: 'white', padding: '20px', marginTop: '20px' }}>
          <h2>Error Detected:</h2>
          <pre>{error.toString()}</pre>
          <pre>{error.stack}</pre>
        </div>
      )}
      
      <h2>Quick Links:</h2>
      <a href="/test" style={{ display: 'block', margin: '10px 0' }}>Go to /test route</a>
      <a href="/auth" style={{ display: 'block', margin: '10px 0' }}>Go to /auth route</a>
      <a href="/dashboard" style={{ display: 'block', margin: '10px 0' }}>Go to /dashboard route</a>
    </div>
  );
}

export default DebugApp;
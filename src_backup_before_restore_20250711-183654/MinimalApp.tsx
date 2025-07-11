import React from 'react';

// Super minimal app - no routing, no auth, no imports
function App() {
  return (
    <div style={{ 
      background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>🎉 App is Running!</h1>
        <p>If you see this, React works!</p>
        <p style={{ fontSize: '16px', marginTop: '20px' }}>
          Time: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

export default App;

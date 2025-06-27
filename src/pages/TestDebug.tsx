import React from 'react';

const TestDebug = () => {
  console.log('TestDebug component rendered');
  
  return (
    <div style={{ 
      padding: '40px', 
      background: '#f0f0f0', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>Debug Test Page</h1>
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>Component Status</h2>
        <p>✅ React is working</p>
        <p>✅ Routing is working</p>
        <p>✅ This component is rendering</p>
      </div>
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
        <h2>Next Steps</h2>
        <p>If you can see this page, the issue is likely with:</p>
        <ul>
          <li>Authentication/Protected routes</li>
          <li>Supabase connection</li>
          <li>Component dependencies</li>
        </ul>
      </div>
    </div>
  );
};

export default TestDebug; 
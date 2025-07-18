import React from 'react';

function App() {
  return (
    <div style={{ 
      padding: '40px', 
      background: 'lightblue', 
      minHeight: '100vh',
      fontSize: '24px',
      fontWeight: 'bold'
    }}>
      <h1>🎉 App is working!</h1>
      <p>If you can see this, React is rendering correctly.</p>
      <p>Time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}

export default App;

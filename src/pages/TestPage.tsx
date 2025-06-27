import React from 'react';

const TestPage = () => {
  return (
    <div style={{ padding: '20px', background: 'lightblue', minHeight: '100vh' }}>
      <h1>Test Page - This should show if routing works</h1>
      <p>If you see this, the routing is working!</p>
      <p>Current URL: {window.location.href}</p>
    </div>
  );
};

export default TestPage;
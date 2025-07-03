import React from 'react';

const TestPage = () => {
  return (
    <div className="w-full h-full bg-red-500 p-8">
      <h1 className="text-3xl font-bold text-white">TEST CONTENT VISIBLE</h1>
      <p className="text-white mt-4">If you can see this red background, the layout is working!</p>
      <div className="mt-8 bg-white p-4 rounded">
        <p>Window width: {window.innerWidth}px</p>
        <p>Window height: {window.innerHeight}px</p>
        <p>User Agent: {navigator.userAgent}</p>
      </div>
    </div>
  );
};

export default TestPage;
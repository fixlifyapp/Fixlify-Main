import React from 'react';

export const LayoutDebugOverlay = () => {
  React.useEffect(() => {
    // Add debug borders to all elements
    const style = document.createElement('style');
    style.innerHTML = `
      .debug-layout * {
        outline: 1px solid red !important;
        outline-offset: -1px;
      }
      .debug-layout [data-sidebar-inset] {
        outline: 2px solid blue !important;
      }
      .debug-layout header {
        outline: 2px solid green !important;
      }
      .debug-layout main {
        outline: 2px solid purple !important;
      }
      .debug-info {
        position: fixed;
        top: 10px;
        right: 10px;
        background: black;
        color: white;
        padding: 10px;
        z-index: 9999;
        font-size: 12px;
        max-width: 300px;
      }
    `;
    document.head.appendChild(style);
    document.body.classList.add('debug-layout');

    // Log all elements between header and content
    const header = document.querySelector('header');
    const pageHeader = document.querySelector('[class*="PageHeader"]');
    const mainContent = document.querySelector('main[data-sidebar-inset] > main');
    
    console.log('Layout Debug:');
    console.log('Header:', header);
    console.log('Header computed styles:', header ? window.getComputedStyle(header) : null);
    console.log('Main content:', mainContent);
    console.log('Main content computed styles:', mainContent ? window.getComputedStyle(mainContent) : null);
    
    if (mainContent && mainContent.firstElementChild) {
      console.log('First child:', mainContent.firstElementChild);
      console.log('First child computed styles:', window.getComputedStyle(mainContent.firstElementChild));
    }

    // Find all elements between header and page content
    if (header && mainContent) {
      let current = header.nextElementSibling;
      while (current && current !== mainContent) {
        console.log('Element between header and main:', current);
        current = current.nextElementSibling;
      }
    }

    return () => {
      document.head.removeChild(style);
      document.body.classList.remove('debug-layout');
    };
  }, []);

  return (
    <div className="debug-info">
      <div>Layout Debug Active</div>
      <div>Check console for details</div>
    </div>
  );
};
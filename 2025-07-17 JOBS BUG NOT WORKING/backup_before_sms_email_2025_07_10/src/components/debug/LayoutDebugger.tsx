import React, { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export const LayoutDebugger = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [sidebarState, setSidebarState] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });

      // Check sidebar state
      const sidebar = document.querySelector('[data-sidebar="sidebar"]');
      const sidebarInset = document.querySelector('[data-sidebar-inset="true"]');
      const mainContent = document.querySelector('main');
      
      const state = {
        sidebarExists: !!sidebar,
        sidebarInsetExists: !!sidebarInset,
        mainContentExists: !!mainContent,
        sidebarWidth: sidebar ? sidebar.getBoundingClientRect().width : 0,
        mainContentWidth: mainContent ? mainContent.getBoundingClientRect().width : 0,
        sidebarDisplay: sidebar ? window.getComputedStyle(sidebar).display : 'none',
        mainDisplay: mainContent ? window.getComputedStyle(mainContent).display : 'none'
      };

      setSidebarState(JSON.stringify(state, null, 2));
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    // Check every second
    const interval = setInterval(updateDimensions, 1000);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearInterval(interval);
    };
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg z-50 max-w-md">
      <h3 className="font-bold mb-2">Layout Debug</h3>
      <div className="text-xs space-y-1">
        <div>Window: {dimensions.width} x {dimensions.height}px</div>
        <div>Device: {isMobile ? 'Mobile' : 'Desktop'}</div>
        <div>Breakpoint: {dimensions.width < 768 ? 'Mobile' : 'Desktop'} ({dimensions.width}px)</div>
        <pre className="mt-2 text-xs overflow-auto max-h-40">{sidebarState}</pre>
      </div>
    </div>
  );
};
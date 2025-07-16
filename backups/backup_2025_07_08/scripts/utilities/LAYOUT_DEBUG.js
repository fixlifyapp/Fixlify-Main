// LAYOUT DEBUG SCRIPT - Run this in browser console (F12)
// This will highlight layout issues visually

(function() {
  console.log('🔍 Starting Fixlify Layout Analysis...\n');
  
  // Check viewport and device type
  const width = window.innerWidth;
  const height = window.innerHeight;
  let deviceType = 'Desktop';
  
  if (width < 640) deviceType = 'Mobile';
  else if (width < 1024) deviceType = 'Tablet';
  else if (width > 1920) deviceType = 'Ultra-wide';
  
  console.log(`📱 Device: ${deviceType} (${width}x${height}px)\n`);
  
  // Analyze main layout containers
  const issues = [];
  
  // 1. Check main containers
  const mainContainers = document.querySelectorAll('main, [data-sidebar-inset], .flex.h-screen');
  console.log(`📦 Found ${mainContainers.length} main layout containers`);
  
  mainContainers.forEach((container, i) => {
    const rect = container.getBoundingClientRect();
    const styles = window.getComputedStyle(container);
    
    // Check for overflow issues
    if (container.scrollHeight > container.clientHeight) {
      issues.push({
        element: container,
        type: 'overflow',
        message: `Container ${i} has vertical overflow (${container.scrollHeight}px content in ${container.clientHeight}px container)`
      });
    }
    
    // Check padding on mobile
    if (deviceType === 'Mobile') {
      const padding = parseFloat(styles.paddingLeft);
      if (padding < 16) {
        issues.push({
          element: container,
          type: 'padding',
          message: `Container ${i} has insufficient mobile padding (${padding}px, should be at least 16px)`
        });
      }
    }
    
    // Check max-width on desktop
    if (deviceType === 'Desktop' || deviceType === 'Ultra-wide') {
      if (!styles.maxWidth || styles.maxWidth === 'none') {
        issues.push({
          element: container,
          type: 'width',
          message: `Container ${i} has no max-width constraint on ${deviceType}`
        });
      }
    }
  });
  
  // 2. Check sidebar
  const sidebar = document.querySelector('[data-sidebar="sidebar"]');
  if (sidebar) {
    const sidebarBg = window.getComputedStyle(sidebar).backgroundColor;
    if (sidebarBg === 'rgba(0, 0, 0, 0)' || sidebarBg === 'transparent') {
      issues.push({
        element: sidebar,
        type: 'background',
        message: 'Sidebar has transparent background'
      });
    }
  }
  
  // 3. Check mobile sidebar
  const mobileSidebar = document.querySelector('[data-mobile="true"]');
  if (mobileSidebar && deviceType === 'Mobile') {
    const mobileBg = window.getComputedStyle(mobileSidebar).backgroundColor;
    if (mobileBg === 'rgba(0, 0, 0, 0)' || mobileBg === 'transparent') {
      issues.push({
        element: mobileSidebar,
        type: 'background',
        message: 'Mobile sidebar has no background color'
      });
    }
  }
  
  // 4. Check content spacing
  const pageHeaders = document.querySelectorAll('[class*="PageHeader"], .page-header, h1');
  pageHeaders.forEach((header, i) => {
    const rect = header.getBoundingClientRect();
    if (rect.top < 20 && i === 0) {
      issues.push({
        element: header,
        type: 'spacing',
        message: `Page header too close to top (${rect.top}px)`
      });
    }
  });
  
  // 5. Check grid layouts
  const grids = document.querySelectorAll('.grid');
  grids.forEach((grid, i) => {
    const gap = window.getComputedStyle(grid).gap;
    if (deviceType === 'Mobile' && parseFloat(gap) > 20) {
      issues.push({
        element: grid,
        type: 'grid',
        message: `Grid ${i} has large gap on mobile (${gap})`
      });
    }
  });
  
  // 6. Check z-index issues
  const highZIndexElements = Array.from(document.querySelectorAll('*')).filter(el => {
    const zIndex = window.getComputedStyle(el).zIndex;
    return zIndex !== 'auto' && parseInt(zIndex) > 100;
  });
  
  if (highZIndexElements.length > 5) {
    issues.push({
      type: 'z-index',
      message: `Found ${highZIndexElements.length} elements with high z-index values`
    });
  }
  
  // Report issues
  console.log(`\n⚠️  Found ${issues.length} layout issues:\n`);
  
  issues.forEach((issue, i) => {
    console.log(`${i + 1}. ${issue.type.toUpperCase()}: ${issue.message}`);
    if (issue.element) {
      // Highlight the problematic element
      issue.element.style.outline = '3px solid red';
      issue.element.style.outlineOffset = '2px';
    }
  });
  
  // Visual debugging overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 20px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    z-index: 99999;
    max-width: 300px;
    max-height: 400px;
    overflow-y: auto;
  `;
  
  overlay.innerHTML = `
    <h3 style="margin: 0 0 10px 0; color: #ff6b6b;">Layout Issues (${issues.length})</h3>
    <div style="color: #4ecdc4; margin-bottom: 10px;">
      Device: ${deviceType} (${width}x${height})
    </div>
    ${issues.map((issue, i) => `
      <div style="margin-bottom: 8px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 4px;">
        <strong style="color: #ffd93d;">${issue.type}:</strong><br>
        ${issue.message}
      </div>
    `).join('')}
    <button onclick="this.parentElement.remove(); document.querySelectorAll('[style*=outline]').forEach(el => el.style.outline = '')" 
            style="margin-top: 10px; padding: 5px 10px; background: #ff6b6b; border: none; border-radius: 4px; color: white; cursor: pointer;">
      Close & Clear
    </button>
  `;
  
  document.body.appendChild(overlay);
  
  // Additional CSS analysis
  const stylesheets = Array.from(document.styleSheets);
  const importantRules = [];
  
  stylesheets.forEach(sheet => {
    try {
      const rules = Array.from(sheet.cssRules || []);
      rules.forEach(rule => {
        if (rule.style && rule.style.cssText.includes('!important')) {
          importantRules.push(rule.selectorText);
        }
      });
    } catch (e) {
      // Cross-origin stylesheets
    }
  });
  
  console.log(`\n📋 CSS Analysis:`);
  console.log(`- ${importantRules.length} rules with !important`);
  console.log(`- ${document.querySelectorAll('[style]').length} inline styles`);
  console.log(`- ${stylesheets.length} stylesheets loaded`);
  
  console.log('\n✅ Layout analysis complete! Red outlines show problematic elements.');
})();

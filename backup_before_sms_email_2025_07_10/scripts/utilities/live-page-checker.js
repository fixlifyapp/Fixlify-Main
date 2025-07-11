// Live page checker script - run this in the browser console
(async function checkAllPages() {
  console.log("=== Fixlify Page Health Check ===");
  console.log("Starting automated page check...\n");

  const results = [];
  
  // Check current page
  const checkCurrentPage = () => {
    const mainElement = document.querySelector('main');
    const hasPageHeader = document.querySelector('[class*="page-header"]') !== null;
    const hasContent = mainElement && mainElement.textContent.trim().length > 50;
    const hasCards = document.querySelectorAll('[class*="card"]').length > 0;
    const hasLoader = document.querySelector('[class*="animate-spin"]') !== null;
    const hasError = document.querySelector('[role="alert"]') !== null;
    const hasSidebar = document.querySelector('[class*="sidebar"]') !== null;
    
    return {
      url: window.location.pathname,
      title: document.title,
      mainElement: !!mainElement,
      hasPageHeader,
      hasContent,
      hasCards,
      hasLoader,
      hasError,
      hasSidebar,
      contentLength: mainElement ? mainElement.textContent.trim().length : 0,
      isBlank: !hasContent && !hasLoader && !hasError
    };
  };

  // List of all routes to check
  const routes = [
    '/dashboard',
    '/jobs', 
    '/clients',
    '/schedule',
    '/finance',
    '/estimates',
    '/invoices',
    '/communications',
    '/messages',
    '/ai-center',
    '/automations',
    '/analytics',
    '/reports',
    '/team',
    '/tasks',
    '/documents',
    '/products',
    '/inventory',
    '/settings',
    '/settings/profile-company',
    '/settings/configuration',
    '/settings/integrations',
    '/settings/phone-numbers',
    '/settings/phone-management',
    '/settings/admin-roles'
  ];

  // Check current page first
  console.log("📍 Current Page Analysis:");
  const currentPageInfo = checkCurrentPage();
  console.table(currentPageInfo);
  
  if (currentPageInfo.isBlank) {
    console.warn("⚠️ Current page appears to be blank!");
  }

  // Provide manual navigation instructions
  console.log("\n📋 Manual Check Instructions:");
  console.log("Please navigate to each of the following pages and run this script again:");
  
  routes.forEach((route, index) => {
    console.log(`${index + 1}. ${route}`);
  });

  console.log("\n🔍 Quick Diagnostics:");
  
  // Check for common issues
  const diagnostics = {
    "Auth Token Present": !!localStorage.getItem('fixlify-auth-token'),
    "Supabase URL": !!import.meta?.env?.VITE_SUPABASE_URL,
    "React Loaded": !!window.React || !!document.querySelector('#root'),
    "Error Boundaries": document.querySelectorAll('[class*="error-boundary"]').length,
    "Loading States": document.querySelectorAll('[class*="loading"], [class*="spinner"]').length,
    "Empty Containers": document.querySelectorAll('main:empty, [role="main"]:empty').length,
    "Console Errors": "Check browser console for red errors"
  };
  
  console.table(diagnostics);

  // Check for specific component issues
  console.log("\n🧩 Component Analysis:");
  
  const componentChecks = {
    "PageLayout Present": !!document.querySelector('[class*="PageLayout"], [class*="page-layout"]'),
    "Sidebar Visible": !!document.querySelector('[class*="sidebar"]:not([class*="collapsed"])'),
    "Header Present": !!document.querySelector('header, [class*="header"]'),
    "Main Content Area": !!document.querySelector('main'),
    "React Root": !!document.querySelector('#root'),
    "Body Classes": document.body.className || "none"
  };
  
  console.table(componentChecks);

  // Look for common error patterns
  console.log("\n⚠️ Common Issues to Check:");
  console.log("1. Network tab for failed API requests (401, 403, 500 errors)");
  console.log("2. Console for JavaScript errors");
  console.log("3. React DevTools for component errors");
  console.log("4. Check if user is properly authenticated");
  console.log("5. Verify Supabase connection is working");

  // Return summary
  return {
    currentPage: currentPageInfo,
    diagnostics,
    componentChecks,
    recommendation: currentPageInfo.isBlank ? 
      "Page appears blank. Check console errors and network requests." : 
      "Page appears to be loading correctly."
  };
})();
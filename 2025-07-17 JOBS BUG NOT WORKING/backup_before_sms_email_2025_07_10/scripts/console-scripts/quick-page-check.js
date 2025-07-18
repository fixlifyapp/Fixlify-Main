// Quick Page Health Check
// Copy and run this in browser console on any Fixlify page

(function quickPageCheck() {
  console.clear();
  console.log("%c🩺 Fixlify Quick Page Check", "font-size: 18px; color: #3b82f6; font-weight: bold;");
  
  // 1. Check current URL and errors
  console.log("\n📍 Current Page:", window.location.pathname);
  
  // 2. Check if React rendered
  const root = document.getElementById('root');
  const hasContent = root && root.children.length > 0;
  console.log("React Rendered:", hasContent ? "✅ Yes" : "❌ No");
  
  // 3. Check for visible content
  const mainContent = document.querySelector('main');
  const visibleText = mainContent ? mainContent.innerText.trim() : "";
  console.log("Main Content:", visibleText.length > 0 ? `✅ ${visibleText.length} chars` : "❌ Empty");
  
  // 4. Check for error messages
  const errorElements = document.querySelectorAll('[class*="error"], [role="alert"]');
  if (errorElements.length > 0) {
    console.log("⚠️ Error Messages Found:");
    errorElements.forEach(el => console.log("  -", el.textContent.trim()));
  }
  
  // 5. Check authentication
  const authToken = localStorage.getItem('fixlify-auth-token');
  console.log("Authenticated:", authToken ? "✅ Yes" : "❌ No");
  
  // 6. Check for loading spinners
  const spinners = document.querySelectorAll('[class*="spin"], [class*="loading"]');
  if (spinners.length > 0) {
    console.log("⏳ Loading indicators:", spinners.length);
  }
  
  // 7. Page-specific checks
  const pageChecks = {
    sidebar: document.querySelector('[class*="sidebar"]'),
    header: document.querySelector('header, [class*="header"]'),
    pageLayout: document.querySelector('[class*="page-layout"], [class*="PageLayout"]'),
    cards: document.querySelectorAll('[class*="card"]').length
  };
  
  console.log("\n🧩 Components:");
  Object.entries(pageChecks).forEach(([name, value]) => {
    console.log(`  ${name}:`, value ? (typeof value === 'number' ? value : '✅') : '❌');
  });
  
  // 8. Network errors check
  console.log("\n🌐 Check Network tab for:");
  console.log("  - Red status codes (401, 403, 404, 500)");
  console.log("  - Failed API requests");
  console.log("  - CORS errors");
  
  // Summary
  const issues = [];
  if (!hasContent) issues.push("React not rendering");
  if (!visibleText.length) issues.push("No visible content");
  if (!authToken) issues.push("Not authenticated");
  if (errorElements.length) issues.push("Error messages present");
  
  console.log("\n📋 Summary:");
  if (issues.length === 0) {
    console.log("✅ Page appears to be working correctly");
  } else {
    console.log("❌ Issues found:");
    issues.forEach(issue => console.log("  -", issue));
  }
  
  return { hasContent, visibleText: visibleText.length, authenticated: !!authToken, errors: errorElements.length };
})();
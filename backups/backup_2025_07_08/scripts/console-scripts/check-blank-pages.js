// Script to check for blank pages in the Fixlify app
// Run this in the browser console when logged into the app

console.log("=== Checking All Pages in Fixlify App ===");

const pagesToCheck = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Jobs", path: "/jobs" },
  { name: "Clients", path: "/clients" },
  { name: "Schedule", path: "/schedule" },
  { name: "Finance", path: "/finance" },
  { name: "Estimates", path: "/estimates" },
  { name: "Invoices", path: "/invoices" },
  { name: "Connect Center", path: "/communications" },
  { name: "Messages", path: "/messages" },
  { name: "AI Center", path: "/ai-center" },
  { name: "Automations", path: "/automations" },
  { name: "Analytics", path: "/analytics" },
  { name: "Reports", path: "/reports" },
  { name: "Team Management", path: "/team" },
  { name: "Tasks", path: "/tasks" },
  { name: "Documents", path: "/documents" },
  { name: "Products", path: "/products" },
  { name: "Inventory", path: "/inventory" },
  { name: "Settings", path: "/settings" },
  { name: "Profile & Company", path: "/settings/profile-company" },
  { name: "Configuration", path: "/settings/configuration" },
  { name: "Integrations", path: "/settings/integrations" },
  { name: "Phone Numbers", path: "/settings/phone-numbers" },
  { name: "Phone Management", path: "/settings/phone-management" },
  { name: "Admin Roles", path: "/settings/admin-roles" }
];

// Function to check if a page is blank
const checkPage = async (page) => {
  const currentPath = window.location.pathname;
  
  // Navigate to the page
  window.location.href = page.path;
  
  // Wait for page to load
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Check page content
  const mainContent = document.querySelector('main') || document.querySelector('[role="main"]') || document.querySelector('.container');
  const hasContent = mainContent && mainContent.textContent.trim().length > 0;
  const hasChildren = mainContent && mainContent.children.length > 0;
  
  // Check for loading spinners
  const hasLoader = document.querySelector('.animate-spin') || document.querySelector('[class*="loader"]');
  
  // Check for error messages
  const hasError = document.querySelector('[class*="error"]') || document.querySelector('[role="alert"]');
  
  return {
    page: page.name,
    path: page.path,
    hasContent,
    hasChildren,
    hasLoader,
    hasError,
    isBlank: !hasContent && !hasChildren && !hasLoader
  };
};

// Check current page first
const currentPageInfo = {
  path: window.location.pathname,
  mainContent: document.querySelector('main'),
  hasContent: document.body.textContent.trim().length > 0,
  childCount: document.body.children.length
};

console.log("Current page info:", currentPageInfo);

// Provide instructions
console.log("\n📋 Instructions:");
console.log("1. Copy this entire script");
console.log("2. Log into the Fixlify app");
console.log("3. Open browser console (F12)");
console.log("4. Paste and run the script");
console.log("5. The script will check each page and report any blank pages");

console.log("\n🔍 Manual check suggested for each route:");
pagesToCheck.forEach(page => {
  console.log(`- ${page.name}: ${window.location.origin}${page.path}`);
});
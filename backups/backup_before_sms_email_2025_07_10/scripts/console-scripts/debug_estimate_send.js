// Debug script for estimate sending issue
// Run this in the browser console on the estimates page

console.log('🔍 Debugging Estimate Send Issue...');

// Check if UniversalSendDialog is rendered
const dialogs = document.querySelectorAll('[role="dialog"]');
console.log('📝 Number of dialogs on page:', dialogs.length);
dialogs.forEach((dialog, index) => {
  console.log(`Dialog ${index + 1}:`, {
    visible: dialog.style.display !== 'none',
    content: dialog.textContent?.substring(0, 100) + '...'
  });
});

// Check for send buttons
const sendButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
  btn.textContent?.includes('Send') || 
  btn.innerHTML?.includes('Send')
);
console.log('📧 Send buttons found:', sendButtons.length);

// Check React components
if (window.React && window.React.version) {
  console.log('⚛️ React version:', window.React.version);
}

// Check for estimate data in the DOM
const estimateElements = document.querySelectorAll('[class*="estimate"]');
console.log('📄 Elements with "estimate" in class:', estimateElements.length);

// Look for dropdown menus
const dropdowns = document.querySelectorAll('[role="menu"]');
console.log('📋 Dropdown menus found:', dropdowns.length);

// Instructions
console.log(`
📌 To debug further:
1. Click on the three dots (⋮) menu for an estimate
2. Click "Send" option
3. Check if a dialog appears
4. Run this script again to see if dialog count changes
5. Check browser console for any errors

If the dialog doesn't appear:
- Check for JavaScript errors in console
- Verify the estimate has valid data
- Check network tab for failed API calls
`);

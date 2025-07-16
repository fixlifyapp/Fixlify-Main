// Browser Console Diagnostic Script
// Copy and paste this entire script into your browser console (F12)

console.log('=== FIXLYFY DIAGNOSTIC TOOL ===');

// Check if page loaded
console.log('1. Document state:', document.readyState);
console.log('2. Document body:', document.body ? 'EXISTS' : 'MISSING');
console.log('3. Root element:', document.getElementById('root') ? 'EXISTS' : 'MISSING');

// Check for JavaScript errors
console.log('4. Window errors:', window.onerror ? 'Handler set' : 'No handler');

// Check React
console.log('5. React global:', typeof React);
console.log('6. ReactDOM global:', typeof ReactDOM);

// Check network
console.log('7. Current URL:', window.location.href);

// Check for content
const root = document.getElementById('root');
if (root) {
  console.log('8. Root innerHTML length:', root.innerHTML.length);
  console.log('9. Root text content:', root.textContent.substring(0, 100));
  console.log('10. Root children:', root.children.length);
}

// Check for scripts
const scripts = Array.from(document.scripts);
console.log('11. Scripts loaded:', scripts.length);
scripts.forEach((script, i) => {
  console.log(`  Script ${i + 1}: ${script.src || 'inline'}`);
});

// Check console for errors
console.log('12. Check the console above for any RED error messages');

// Try to manually render something
if (root && !root.innerHTML) {
  console.log('13. Attempting manual render...');
  root.innerHTML = '<h1 style="color: red;">Manual render test - If you see this, JavaScript works!</h1>';
}

console.log('=== END DIAGNOSTIC ===');
